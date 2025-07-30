"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Building,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { Contrato, User } from "@prisma/client";

interface ContratoDetailClientProps {
  contrato: Contrato & {
    fiscalAdministrativo?: Pick<
      User,
      "id" | "name" | "email" | "whatsapp"
    > | null;
    fiscalTecnico?: Pick<User, "id" | "name" | "email" | "whatsapp"> | null;
    fiscalSubstituto?: Pick<User, "id" | "name" | "email" | "whatsapp"> | null;
  };
}

export function ContratoDetailClient({ contrato }: ContratoDetailClientProps) {
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
        <Link href="/contratos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">
            Contrato {contrato.numeroContrato}
          </h1>
          <p className="text-sm text-muted-foreground">
            Detalhes completos do contrato
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/contratos/${contrato.id}/editar`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
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

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Dados Básicos */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Básicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Processo Administrativo
                    </div>
                    <p className="text-sm">{contrato.processoAdministrativo}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Modalidade
                    </div>
                    <p className="text-sm">{contrato.modalidadeLicitacao}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Data de Assinatura
                    </div>
                    <p className="text-sm">
                      {formatDate(contrato.dataAssinatura)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados da Contratada */}
            <Card>
              <CardHeader>
                <CardTitle>Contratada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Nome
                    </div>
                    <p className="text-sm">{contrato.nomeContratada}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      CNPJ
                    </div>
                    <p className="text-sm">{contrato.cnpjContratada}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Representante Legal
                    </div>
                    <p className="text-sm">{contrato.representanteLegal}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Telefone
                    </div>
                    <p className="text-sm">{contrato.telefoneContratada}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      E-mail
                    </div>
                    <p className="text-sm">{contrato.emailContratada}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados Financeiros */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Financeiros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Valor Total
                    </div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(contrato.valorTotal)}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Tipo de Garantia
                    </div>
                    <p className="text-sm">{contrato.tipoGarantia}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Valor da Garantia
                    </div>
                    <p className="text-sm">
                      {formatCurrency(contrato.valorGarantia ?? 0)}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Vigência da Garantia
                    </div>
                    <p className="text-sm">
                      {formatDate(contrato.vigenciaGarantia)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados de Vigência */}
            <Card>
              <CardHeader>
                <CardTitle>Vigência e Reajuste</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Período de Vigência
                    </div>
                    <p className="text-sm">
                      {formatDate(contrato.vigenciaInicio)} até{" "}
                      {formatDate(contrato.vigenciaTermino)}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Data-Base para Reajuste
                    </div>
                    <p className="text-sm">
                      {formatDate(contrato.dataBaseReajuste)}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Índice de Reajuste
                    </div>
                    <p className="text-sm">{contrato.indiceReajuste}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Responsáveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Responsáveis pelo Contrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Gestor */}
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
                        {contrato.fiscalAdministrativo?.name ||
                          contrato.fiscalAdministrativoLegacy ||
                          "Não informado"}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        E-mail
                      </div>
                      <p className="text-sm">{contrato.emailFiscalAdm}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        Telefone
                      </div>
                      <p className="text-sm">{contrato.telefoneFiscalAdm}</p>
                    </div>
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
                      <p className="text-sm">
                        {contrato.fiscalTecnico?.name ||
                          contrato.fiscalTecnicoLegacy ||
                          "Não informado"}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        E-mail
                      </div>
                      <p className="text-sm">{contrato.emailFiscalTec}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        Telefone
                      </div>
                      <p className="text-sm">{contrato.telefoneFiscalTec}</p>
                    </div>
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
