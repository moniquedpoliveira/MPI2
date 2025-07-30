"use server"

import { prisma } from "@/lib/prisma";
import { generateQuery } from "@/lib/sql-query-builder";

export const runSQLQuery = async (input: string) => {
  const result = await generateQuery(input);

  const queryResult = await prisma.$queryRaw(result as any);

  return queryResult;
}