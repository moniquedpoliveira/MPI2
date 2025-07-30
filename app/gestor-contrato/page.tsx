import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  FileText,
  AlertTriangle,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getContratosStats, getContratosFiltered } from "@/actions/contratos";

export default async function Dashboard() {
  const stats = await getContratosStats();
  const contratos = await getContratosFiltered();

  // Contratos que vencem nos próximos 30 dias
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const contratosVencendo = contratos.filter((c) => {
    const vigenciaTermino = new Date(c.vigenciaTermino);
    return vigenciaTermino <= thirtyDaysFromNow && vigenciaTermino >= now;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div>
          <h1 className="font-semibold text-lg">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral dos contratos públicos
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Contratos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                contratos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Contratos Ativos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.ativos}
              </div>
              <p className="text-xs text-muted-foreground">em vigência</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Atenção Requerida
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.vencendoEm30Dias}
              </div>
              <p className="text-xs text-muted-foreground">vencem em 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.valorTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                em contratos ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contratos que Requerem Atenção */}
        {contratosVencendo.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Contratos que Requerem Atenção
              </CardTitle>
              <CardDescription>
                Contratos que vencem nos próximos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contratosVencendo.map((contrato) => (
                  <div
                    key={contrato.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{contrato.numeroContrato}</p>
                      <p className="text-sm text-muted-foreground">
                        {contrato.objeto}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Contratada:</span>{" "}
                        {contrato.nomeContratada}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-600"
                      >
                        <CalendarDays className="h-3 w-3 mr-1" />
                        Vence em{" "}
                        {formatDate(contrato.vigenciaTermino.toISOString())}
                      </Badge>
                      <p className="text-sm font-medium">
                        {formatCurrency(contrato.valorTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo dos Contratos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Contratos Recentes</CardTitle>
            <CardDescription>
              Últimos contratos cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contratos.slice(0, 5).map((contrato) => (
                <div
                  key={contrato.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{contrato.numeroContrato}</p>
                    <p className="text-sm text-muted-foreground">
                      {contrato.objeto}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Modalidade:</span>{" "}
                      {contrato.modalidadeLicitacao}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">
                      {formatCurrency(contrato.valorTotal)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vigência:{" "}
                      {formatDate(contrato.vigenciaInicio.toISOString())} -{" "}
                      {formatDate(contrato.vigenciaTermino.toISOString())}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
