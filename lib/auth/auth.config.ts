import type { NextAuthConfig, User } from "next-auth";
import { Credentials } from "./providers/credentials";

export const authOptions: NextAuthConfig = {
  providers: [Credentials],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/entrar",
    verifyRequest: "/magiclink",
    // error: "/entrar?error=true",
    signOut: "/entrar?deslogado=true",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const u = user as User;
        token.id = u.id;
        token.role = u.role;
        token.name = u.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role;
        session.user.name = token.name ?? "";

      }

      return session;
    },
  },
};
