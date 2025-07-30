"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export interface UserStats {
  total: number;
  ativos: number;
  inativos: number;
  hojeAtivos: number;
  porRole: {
    [key: string]: number;
  };
}

export async function getUsersStats(): Promise<UserStats> {
  const [
    total,
    ativos,
    inativos,
    hojeAtivos,
    porRole
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { isActive: true, deletedAt: null } }),
    prisma.user.count({ where: { isActive: false, deletedAt: null } }),
    prisma.user.count({
      where: {
        lastLogin: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        },
        deletedAt: null
      }
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })
  ]);

  const roleStats = porRole.reduce((acc, item) => {
    acc[item.role] = item._count.role;
    return acc;
  }, {} as { [key: string]: number });

  return {
    total,
    ativos,
    inativos,
    hojeAtivos,
    porRole: roleStats
  };
}

export async function getUsers() {
  return await prisma.user.findMany({
    where: {
      deletedAt: null
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      role: true,
      createdAt: true,
      lastLogin: true,
      whatsapp: true
    }
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  whatsapp?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as any,
      whatsapp: data.whatsapp
    }
  });

  revalidatePath('/administrador');
  return user;
}

export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  role?: string;
  whatsapp?: string;
}) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      role: data.role as any,
      whatsapp: data.whatsapp
    }
  });

  revalidatePath('/administrador');
  return user;
}

export async function toggleUserStatus(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { isActive: true }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive }
  });

  revalidatePath('/administrador');
  return updatedUser;
}

export async function changeUserPassword(id: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });

  revalidatePath('/administrador');
  return user;
}

export async function deleteUser(id: string) {
  const user = await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  revalidatePath('/administrador');
  return user;
} 