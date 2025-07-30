import { Card, CardContent } from "@/components/ui/card";
import { Building, DollarSign, Calendar } from "lucide-react";
import type { Contrato } from "@prisma/client";
import React from "react";

interface ContratoHeaderProps {
  contrato: Contrato;
  statusBadge: React.ReactNode;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date | null | undefined) => string;
}

export function ContratoHeader({
  contrato,
  statusBadge,
  formatCurrency,
  formatDate,
}: ContratoHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{contrato.numeroContrato}</h2>
              {statusBadge}
            </div>
            <p className="text-muted-foreground">{contrato.objeto}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {contrato.orgaoContratante}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(contrato.valorTotal)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(contrato.vigenciaInicio)} -{" "}
                {formatDate(contrato.vigenciaTermino)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
