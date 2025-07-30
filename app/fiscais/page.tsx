"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  CalendarDays,
  DollarSign,
  Building,
  CheckCircle,
  Clock,
  Download,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getContratosByFiscal } from "@/actions/fiscais";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiscaisDashboardStats } from "@/components/fiscais-dashboard-stats";
import { NotificationsPanel } from "@/components/notifications-panel";

export default function FiscaisDashboard() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: contratos, isLoading } = useQuery({
    queryKey: [
      "contratos-fiscal",
      session?.user?.id,
      session?.user?.role,
      debouncedSearchTerm,
    ],
    queryFn: () => {
      if (!session?.user?.id || !session?.user?.role) {
        return Promise.resolve([]);
      }
      return getContratosByFiscal(
        session.user.id,
        session.user.role,
        debouncedSearchTerm
      );
    },
    enabled: !!session?.user?.id && !!session?.user?.role,
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

  const getStatusBadge = (vigenciaTermino: string) => {
    const now = new Date();
    const termino = new Date(vigenciaTermino);
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    if (termino < now) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    if (termino <= thirtyDaysFromNow) {
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

  const getChecklistStatus = (contrato: any) => {
    // Por enquanto, vamos simular o status do checklist
    // Em uma implementação real, isso viria do banco de dados
    const isCompleted = Math.random() > 0.5; // Simulação
    const progress = Math.floor(Math.random() * 100); // Simulação

    if (isCompleted) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600">Completo</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-600">{progress}% completo</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Meus Contratos</h1>
          <p className="text-sm text-muted-foreground">
            Contratos sob sua fiscalização
          </p>
        </div>
        <NotificationsPanel />
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Dashboard Stats */}
        <FiscaisDashboardStats />

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Contracts List */}
        <div className="space-y-4 pb-40">
          {isLoading ? (
            <div className="text-center py-8">Carregando contratos...</div>
          ) : contratos && contratos.length > 0 ? (
            contratos.map((contrato) => (
              <Card key={contrato.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {contrato.numeroContrato}
                        </h3>
                        {getStatusBadge(contrato.vigenciaTermino.toISOString())}
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
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(
                            contrato.vigenciaInicio.toISOString()
                          )} -{" "}
                          {formatDate(contrato.vigenciaTermino.toISOString())}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          <strong>Contratada:</strong> {contrato.nomeContratada}
                        </span>
                        <span>
                          <strong>Modalidade:</strong>{" "}
                          {contrato.modalidadeLicitacao}
                        </span>
                      </div>

                      {/* Checklist Status */}
                      <div className="pt-2">{getChecklistStatus(contrato)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/fiscais/contratos/${contrato.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Fiscalizar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Nenhum contrato encontrado para a busca."
                  : "Nenhum contrato atribuído a você."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
