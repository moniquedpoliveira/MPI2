"use client";

import { useState, useEffect } from "react";
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
import { CalendarDays, Search, Plus, Eye } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import { getContratosFiltered } from "@/actions/contratos";
import type { Contrato } from "@prisma/client";

interface ContratosClientProps {
  initialContratos: Contrato[];
}

export function ContratosClient({ initialContratos }: ContratosClientProps) {
  const [contratos, setContratos] = useState<Contrato[]>(initialContratos);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchFilteredContratos = async () => {
      setIsLoading(true);
      try {
        const filteredContratos =
          await getContratosFiltered(debouncedSearchTerm);
        setContratos(filteredContratos);
      } catch (error) {
        console.error("Error fetching filtered contracts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredContratos();
  }, [debouncedSearchTerm]);

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
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Contratos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os contratos públicos
          </p>
        </div>
        <Link href="/contratos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </Link>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Encontre contratos específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número, objeto ou contratada..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Contratos */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
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

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium">Contratada</p>
                          <p className="text-sm text-muted-foreground">
                            {contrato.nomeContratada}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Modalidade</p>
                          <p className="text-sm text-muted-foreground">
                            {contrato.modalidadeLicitacao}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Valor</p>
                          <p className="text-sm font-semibold">
                            {formatCurrency(contrato.valorTotal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Vigência</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(contrato.vigenciaInicio.toISOString())}{" "}
                            -{" "}
                            {formatDate(contrato.vigenciaTermino.toISOString())}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Gestor</p>
                          <p className="text-sm text-muted-foreground">
                            {contrato.gestorContrato}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Órgão</p>
                          <p className="text-sm text-muted-foreground">
                            {contrato.orgaoContratante}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Link href={`/contratos/${contrato.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!isLoading && contratos.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {searchTerm
                  ? "Nenhum contrato encontrado"
                  : "Nenhum contrato encontrado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Tente ajustar os filtros de busca."
                  : "Comece adicionando seu primeiro contrato ao sistema."}
              </p>
              {!searchTerm && (
                <Link href="/contratos/novo">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Contrato
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
