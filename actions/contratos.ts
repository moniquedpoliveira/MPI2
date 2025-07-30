"use server";

import { prisma } from "@/lib/prisma";
import type { Contrato, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const getContratosStats = async () => {
  const contratos = await prisma.contrato.findMany();
  return {
    total: contratos.length,
    ativos: contratos.filter((c) => c.vigenciaTermino > new Date()).length,
    vencendoEm30Dias: contratos.filter((c) => {
      const vigenciaTermino = new Date(c.vigenciaTermino);
      return (
        vigenciaTermino <=
          new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) &&
        vigenciaTermino >= new Date()
      );
    }).length,
    valorTotal: contratos.reduce((acc, c) => acc + c.valorTotal, 0),
  };
};

export const getContratos = async (debouncedSearchTerm: string) => {
  const contratos = await prisma.contrato.findMany();
  return contratos;
};

export const getContratosFiltered = async (search?: string) => {
  const where: Prisma.ContratoWhereInput = {};

  if (search?.trim()) {
    where.OR = [
      { numeroContrato: { contains: search, mode: "insensitive" } },
      { objeto: { contains: search, mode: "insensitive" } },
      { nomeContratada: { contains: search, mode: "insensitive" } },
      { orgaoContratante: { contains: search, mode: "insensitive" } },
      { gestorContrato: { contains: search, mode: "insensitive" } },
    ];
  }

  const contratos = await prisma.contrato.findMany({
    where,
    orderBy: { vigenciaTermino: "asc" },
  });

  return contratos;
};

export const getContratoById = async (id: string) => {
  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: {
      fiscalAdministrativo: {
        select: { id: true, name: true, email: true, whatsapp: true },
      },
      fiscalTecnico: {
        select: { id: true, name: true, email: true, whatsapp: true },
      },
      fiscalSubstituto: {
        select: { id: true, name: true, email: true, whatsapp: true },
      },
    },
  });
  return contrato;
};

export const createContrato = async (contrato: Prisma.ContratoCreateInput) => {
  const newContrato = await prisma.contrato.create({
    data: contrato,
  });

  revalidatePath("/");
  return newContrato;
};

export const updateContrato = async (id: string, contrato: any) => {
  const updatedContrato = await prisma.contrato.update({
    where: { id },
    data: contrato,
  });

  revalidatePath("/");
  return updatedContrato;
};

export const deleteContrato = async (id: string) => {
  const deletedContrato = await prisma.contrato.delete({
    where: { id },
  });

  revalidatePath("/");
  return deletedContrato;
};

export const getContratoByNumero = async (numero: string) => {
  const contrato = await prisma.contrato.findUnique({
    where: { numeroContrato: numero },
  });
  return contrato;
};

export async function getStatusDetails(
  contrato: Contrato,
  now: Date,
  thirtyDaysFromNow: Date
) {
  const vigenciaTerminoDate = new Date(contrato.vigenciaTermino);
  if (vigenciaTerminoDate < now) return "vencido";
  if (vigenciaTerminoDate <= thirtyDaysFromNow) return "vencendoEm30Dias";
  return "ativo";
}
