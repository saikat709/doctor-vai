import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  // Use explicit secret fallback: prefer NEXTAUTH_SECRET but allow AUTH_SECRET for local/dev
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  ...authConfig,
});
