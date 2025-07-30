import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getChecklistItems } from "@/actions/fiscais";
import type { ChecklistType } from "@prisma/client";
import { ChecklistPageWrapper } from "./ChecklistPageWrapper";

interface ChecklistPageProps {
  params: Promise<{ id: string; tipo: string }>;
}

export default async function ChecklistPage({ params }: ChecklistPageProps) {
  const { id, tipo } = await params;
  if (tipo !== "administrativo" && tipo !== "tecnico") {
    notFound();
  }

  const contrato = await prisma.contrato.findUnique({ where: { id } });
  if (!contrato) notFound();

  const fiscalType: ChecklistType =
    tipo === "administrativo" ? "ADMINISTRATIVA" : "TECNICA";
  const checklistItems = await getChecklistItems(id, fiscalType);

  return (
    <div className="w-full p-4">
      <div className="mb-6 flex items-center gap-2">
        <Link href={`/ordenador-despesas/contratos/${id}`}>
          <ArrowLeft className="inline-block w-4 h-4 mr-1" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold ml-4">
          Checklist - Fiscal{" "}
          {tipo === "administrativo" ? "Administrativo" : "Técnico"}
        </h1>
      </div>
      <p className="mb-6 text-muted-foreground">
        Contrato: {contrato.numeroContrato} - {contrato.objeto}
      </p>
      <Card className="overflow-x-auto">
        <ChecklistPageWrapper
          checklistItems={checklistItems}
          contrato={contrato}
          tipo={tipo}
          id={id}
        />
      </Card>
    </div>
  );
}
