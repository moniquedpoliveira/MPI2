"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, DollarSign, Building } from "lucide-react";
import Link from "next/link";
import type { Contrato, User } from "@prisma/client";
import { use } from "react";
import { useParams } from "next/navigation";

interface ContratoDetailOrdenadorProps {
  contrato: Contrato & {
    fiscalAdministrativo?: Pick<
      User,
      "id" | "name" | "email" | "whatsapp"
    > | null;
    fiscalTecnico?: Pick<User, "id" | "name" | "email" | "whatsapp"> | null;
    fiscalSubstituto?: Pick<User, "id" | "name" | "email" | "whatsapp"> | null;
  };
}

export function ContratoDetailOrdenador({
  contrato,
}: ContratoDetailOrdenadorProps) {
  const { id } = useParams();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (vigenciaTermino: Date) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    if (vigenciaTermino < now) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    if (vigenciaTermino <= thirtyDaysFromNow) {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          Atenção
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-green-600 border-green-600">
        Ativo
      </Badge>
    );
  };

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ordenador-despesas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="font-semibold text-lg">Detalhes do Contrato</h1>
          <p className="text-sm text-muted-foreground">
            {contrato.numeroContrato}
          </p>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header do Contrato */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">
                      {contrato.numeroContrato}
                    </h2>
                    {getStatusBadge(contrato.vigenciaTermino)}
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

          {/* Responsáveis */}
          <Card>
            <CardHeader>
              <CardTitle>Responsáveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Gestor do Contrato */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Gestor do Contrato</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        Nome
                      </div>
                      <p className="text-sm">{contrato.gestorContrato}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        E-mail
                      </div>
                      <p className="text-sm">{contrato.emailGestor}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        Telefone
                      </div>
                      <p className="text-sm">{contrato.telefoneGestor}</p>
                    </div>
                  </div>
                </div>
                {/* Fiscal Administrativo */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">
                    Fiscal Administrativo
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        Nome
                      </div>
                      <p className="text-sm">
                        {contrato.fiscalAdministrativo?.name}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        E-mail
                      </div>
                      <p className="text-sm">
                        {contrato.fiscalAdministrativo?.email}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        Telefone
                      </div>
                      <p className="text-sm">
                        {contrato.fiscalAdministrativo?.whatsapp}
                      </p>
                    </div>
                    <Button asChild variant="secondary" className="mt-2 w-full">
                      <Link href={`/contratos/${id}/checklist/administrativo`}>
                        Visualizar andamento
                      </Link>
                    </Button>
                  </div>
                </div>
                {/* Fiscal Técnico */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Fiscal Técnico</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        Nome
                      </div>
                      <p className="text-sm">{contrato.fiscalTecnico?.name}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        E-mail
                      </div>
                      <p className="text-sm">{contrato.fiscalTecnico?.email}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        Telefone
                      </div>
                      <p className="text-sm">
                        {contrato.fiscalTecnico?.whatsapp}
                      </p>
                    </div>
                    <Button asChild variant="secondary" className="mt-2 w-full">
                      <Link href={`/contratos/${id}/checklist/tecnico`}>
                        Visualizar andamento
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Endereço da Contratada
                  </div>
                  <p className="text-sm">{contrato.enderecoContratada}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Sanção Administrativa
                  </div>
                  <p className="text-sm">{contrato.sancaoAdministrativa}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
