import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect all routes except static assets, favicon, and auth API endpoints
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
