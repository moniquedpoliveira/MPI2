"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  DollarSign,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getContratosByFiscal } from "@/actions/fiscais";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface DashboardStats {
  totalContratos: number;
  contratosAtivos: number;
  contratosVencendo: number;
  contratosVencidos: number;
  valorTotalContratos: number;
  checklistsCompletos: number;
  checklistsEmProgresso: number;
  checklistsNaoIniciados: number;
  progressoGeral: number;
  contratosComPrazoCritico: number;
}

export function FiscaisDashboardStats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalContratos: 0,
    contratosAtivos: 0,
    contratosVencendo: 0,
    contratosVencidos: 0,
    valorTotalContratos: 0,
    checklistsCompletos: 0,
    checklistsEmProgresso: 0,
    checklistsNaoIniciados: 0,
    progressoGeral: 0,
    contratosComPrazoCritico: 0,
  });

  const { data: contratos, isLoading } = useQuery({
    queryKey: [
      "contratos-fiscal-stats",
      session?.user?.id,
      session?.user?.role,
    ],
    queryFn: () => {
      if (!session?.user?.id || !session?.user?.role) {
        return Promise.resolve([]);
      }
      return getContratosByFiscal(session.user.id, session.user.role);
    },
    enabled: !!session?.user?.id && !!session?.user?.role,
  });

  useEffect(() => {
    if (contratos) {
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      const sevenDaysFromNow = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000
      );

      const newStats: DashboardStats = {
        totalContratos: contratos.length,
        contratosAtivos: 0,
        contratosVencendo: 0,
        contratosVencidos: 0,
        valorTotalContratos: 0,
        checklistsCompletos: 0,
        checklistsEmProgresso: 0,
        checklistsNaoIniciados: 0,
        progressoGeral: 0,
        contratosComPrazoCritico: 0,
      };

      let totalProgress = 0;

      for (const contrato of contratos) {
        // Calcular valor total
        newStats.valorTotalContratos += contrato.valorTotal;

        // Verificar status do contrato
        const vigenciaTermino = new Date(contrato.vigenciaTermino);

        if (vigenciaTermino < now) {
          newStats.contratosVencidos++;
        } else if (vigenciaTermino <= sevenDaysFromNow) {
          newStats.contratosComPrazoCritico++;
          newStats.contratosVencendo++;
        } else if (vigenciaTermino <= thirtyDaysFromNow) {
          newStats.contratosVencendo++;
        } else {
          newStats.contratosAtivos++;
        }

        // Simular status do checklist (em uma implementação real, isso viria do banco)
        const checklistStatus = Math.random();
        if (checklistStatus > 0.8) {
          newStats.checklistsCompletos++;
          totalProgress += 100;
        } else if (checklistStatus > 0.3) {
          newStats.checklistsEmProgresso++;
          totalProgress += Math.floor(checklistStatus * 100);
        } else {
          newStats.checklistsNaoIniciados++;
        }
      }

      newStats.progressoGeral =
        newStats.totalContratos > 0
          ? Math.round(totalProgress / newStats.totalContratos)
          : 0;

      setStats(newStats);
    }
  }, [contratos]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Carregando...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Contratos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContratos}</div>
            <p className="text-xs text-muted-foreground">
              Sob sua fiscalização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.valorTotalContratos)}
            </div>
            <p className="text-xs text-muted-foreground">Valor dos contratos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progresso Geral
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.progressoGeral}%</div>
            <Progress value={stats.progressoGeral} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Média dos checklists
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contratos Ativos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contratosAtivos}</div>
            <p className="text-xs text-muted-foreground">Em execução normal</p>
          </CardContent>
        </Card>
      </div>

      {/* Status dos contratos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Status dos Contratos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Ativos</span>
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                {stats.contratosAtivos}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Vencendo (30 dias)</span>
              <Badge
                variant="outline"
                className="text-yellow-600 border-yellow-600"
              >
                {stats.contratosVencendo}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Vencidos</span>
              <Badge variant="destructive">{stats.contratosVencidos}</Badge>
            </div>
            {stats.contratosComPrazoCritico > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Prazo Crítico (7 dias)</span>
                <Badge variant="destructive" className="animate-pulse">
                  {stats.contratosComPrazoCritico}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Status dos Checklists
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Completos</span>
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                {stats.checklistsCompletos}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Em Progresso</span>
              <Badge
                variant="outline"
                className="text-yellow-600 border-yellow-600"
              >
                {stats.checklistsEmProgresso}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Não Iniciados</span>
              <Badge
                variant="outline"
                className="text-gray-600 border-gray-600"
              >
                {stats.checklistsNaoIniciados}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.contratosComPrazoCritico > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {stats.contratosComPrazoCritico} contrato(s) com prazo
                    crítico
                  </p>
                  <p className="text-xs text-red-600">
                    Vencem em menos de 7 dias
                  </p>
                </div>
              </div>
            )}
            {stats.contratosVencidos > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    {stats.contratosVencidos} contrato(s) vencido(s)
                  </p>
                  <p className="text-xs text-orange-600">
                    Requer atenção imediata
                  </p>
                </div>
              </div>
            )}
            {stats.checklistsNaoIniciados > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    {stats.checklistsNaoIniciados} checklist(s) não iniciado(s)
                  </p>
                  <p className="text-xs text-blue-600">Inicie a fiscalização</p>
                </div>
              </div>
            )}
            {stats.contratosComPrazoCritico === 0 &&
              stats.contratosVencidos === 0 &&
              stats.checklistsNaoIniciados === 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Tudo em ordem!
                    </p>
                    <p className="text-xs text-green-600">
                      Nenhum alerta pendente
                    </p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
