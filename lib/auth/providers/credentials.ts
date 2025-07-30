import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";

export const Credentials: Provider = CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const { email, password } = credentials as {
      email: string;
      password: string;
    };

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        password: true,
        isActive: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(password, user.password);

    console.log(isPasswordValid, user.isActive);

    if (!isPasswordValid || !user.isActive) {
      throw new Error("Usuário inativo ou senha inválida");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? "",
      createdAt: user.createdAt,
      role: user.role,
    };
  },
});
