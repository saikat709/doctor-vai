import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { isOffline } from "@/lib/env";
import { stripLocalePrefix } from "@/lib/locale";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (isOffline) {
        return true;
      }

      const isLoggedIn = !!auth?.user;
      const pathname = stripLocalePrefix(nextUrl.pathname);
      const isOnDashboard = pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (
          credentials?.email === "worker@health.gov" &&
          credentials?.password === "password123"
        ) {
          return {
            id: "1",
            name: "Field Medic Saikat",
            email: "worker@health.gov",
            role: "HealthWorker",
          };
        }
        if (
          credentials?.email === "admin@health.gov" &&
          credentials?.password === "password123"
        ) {
          return {
            id: "2",
            name: "Admin Doctor Saikat",
            email: "admin@health.gov",
            role: "Admin",
          };
        }
        if (
          credentials?.email === "superadmin@health.gov" &&
          credentials?.password === "password123"
        ) {
          return {
            id: "3",
            name: "SuperAdmin Saikat",
            email: "superadmin@health.gov",
            role: "SuperAdmin",
          };
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
