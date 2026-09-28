import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isMentorRoute = nextUrl.pathname.startsWith("/mentor");
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      // Public or unauthenticated guard
      if (isAdminRoute || isDashboardRoute || isMentorRoute) {
        if (!isLoggedIn) return false; // Redirect unauthenticated users to /login

        const userRoles: string[] =
          (auth?.user as unknown as { roles?: string[] })?.roles ?? [];

        if (isAdminRoute) {
          const hasAdmin = userRoles.includes("admin") || userRoles.includes("super_admin");
          if (!hasAdmin) {
            return Response.redirect(new URL("/unauthorized", nextUrl));
          }
        }

        if (isMentorRoute) {
          const hasMentor =
            userRoles.includes("mentor") ||
            userRoles.includes("admin") ||
            userRoles.includes("super_admin");
          if (!hasMentor) {
            return Response.redirect(new URL("/unauthorized", nextUrl));
          }
        }

        return true;
      }

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as unknown as { roles?: string[] }).roles ?? ["student"];
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { roles: string[] }).roles =
          (token.roles as string[]) ?? ["student"];
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts with full Node runtime
} satisfies NextAuthConfig;
