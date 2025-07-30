import NextAuth, { type DefaultSession, type DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;

  }
}
