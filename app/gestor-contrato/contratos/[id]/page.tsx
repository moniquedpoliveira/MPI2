import { notFound } from "next/navigation";
import { getContratoById } from "@/actions/contratos";
import { ContratoDetailClient } from "./page-client";

interface ContratoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContratoDetailPage({
  params,
}: ContratoDetailPageProps) {
  const { id } = await params;
  const contrato = await getContratoById(id);

  if (!contrato) {
    notFound();
  }

  return <ContratoDetailClient contrato={contrato} />;
}
