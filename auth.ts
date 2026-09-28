import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              roles: {
                include: { role: true },
              },
            },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          // Check if account is suspended
          if (user.suspendedAt) {
            throw new Error("Account has been suspended. Please contact support.");
          }

          // Check account lock
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error("Account is temporarily locked. Please try again later.");
          }

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

          if (!passwordsMatch) {
            // Track failed attempts and lock after 5 attempts
            const attempts = user.failedLoginAttempts + 1;
            const lockTime =
              attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: attempts,
                lockedUntil: lockTime,
              },
            });

            return null;
          }

          // Reset failed attempts on success
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date(),
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            roles: user.roles.map((r) => r.role.key),
          };
        } catch (error) {
          console.error("[auth] Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});
