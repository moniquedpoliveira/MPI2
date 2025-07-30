import { authOptions } from "@/lib/auth/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { prisma } from "../prisma";

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
  unstable_update,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authOptions,
});
