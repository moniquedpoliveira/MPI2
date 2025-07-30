import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getContratoByIdForFiscal } from "@/actions/fiscais";
import { ContratoDetailFiscal } from "./contrato-detail-fiscal";

interface ContratoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContratoDetailPage({
  params,
}: ContratoDetailPageProps) {
  const session = await auth();

  if (!session?.user?.email || !session?.user?.id || !session?.user?.role) {
    notFound();
  }

  const { id } = await params;

  const contrato = await getContratoByIdForFiscal(
    id,
    session.user.id,
    session.user.role
  );

  if (!contrato) {
    notFound();
  }

  return <ContratoDetailFiscal contrato={contrato} />;
}
