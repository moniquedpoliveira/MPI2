import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContratoDetailOrdenador } from "./contrato-detail-ordenador";

interface ContratoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContratoDetailPage({
  params,
}: ContratoDetailPageProps) {
  const { id } = await params;

  const contrato = await prisma.contrato.findUnique({
    where: { id },
  });

  if (!contrato) {
    notFound();
  }

  return <ContratoDetailOrdenador contrato={contrato} />;
}
