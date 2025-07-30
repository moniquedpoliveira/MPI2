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
import { Search, Eye, CalendarDays, DollarSign, Building } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getContratos } from "@/actions/contratos";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function OrdenadorDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: contratos, isLoading } = useQuery({
    queryKey: ["contratos", debouncedSearchTerm],
    queryFn: () => getContratos(debouncedSearchTerm),
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
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
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

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div>
          <h1 className="font-semibold text-lg">Contratos</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e acompanhe todos os contratos
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
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
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando contratos...</div>
          ) : (
            contratos?.map((contrato) => (
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
                          {formatDate(contrato.vigenciaInicio.toISOString())} -{" "}
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
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/ordenador-despesas/contratos/${contrato.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
