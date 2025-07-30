"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Building,
  FileText,
  Download,
  Save,
  MessageSquare,
  Clock,
  User,
  MoreHorizontal,
  Edit,
  Plus,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import type {
  Contrato,
  ChecklistItemStatus,
  ChecklistType,
} from "@prisma/client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  getChecklistItems,
  updateChecklistItem,
  requestClarification,
  answerClarification,
} from "@/actions/fiscais";
import { toast } from "sonner";
import { downloadPDF, openPDFInNewTab } from "@/lib/pdf-generator";
import { ContratoHeader } from "./_components/ContratoHeader";
import { ChecklistTable } from "./_components/ChecklistTable";
import { ObservationCard } from "./_components/ObservationCard";
import { ClarificationCard } from "./_components/ClarificationCard";

interface ChecklistItemWithRelations {
  id: string;
  contratoId: string;
  checklistId: string;
  status: ChecklistItemStatus;
  currentObservation: string | null;
  createdAt: Date;
  updatedAt: Date;
  checklist: {
    id: string;
    text: string;
    type: ChecklistType;
    createdAt: Date;
  };
  observationHistory: Array<{
    id: string;
    status: ChecklistItemStatus;
    observation: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  esclarecimentos: Array<{
    id: string;
    question: string;
    answer: string | null;
    askedAt: Date;
    answeredAt: Date | null;
    askedBy: {
      id: string;
      name: string | null;
      email: string;
    };
    answeredBy: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }>;
}

interface ContratoDetailFiscalProps {
  contrato: Contrato;
}

export function ContratoDetailFiscal({ contrato }: ContratoDetailFiscalProps) {
  const { data: session } = useSession();
  const [checklistItems, setChecklistItems] = useState<
    ChecklistItemWithRelations[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [newObservations, setNewObservations] = useState<
    Record<string, string>
  >({});
  const [newClarifications, setNewClarifications] = useState<
    Record<string, string>
  >({});
  const [newAnswers, setNewAnswers] = useState<Record<string, string>>({});

  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ChecklistItemWithRelations | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<ChecklistItemStatus>("PENDENTE");
  const [observationDialogOpen, setObservationDialogOpen] = useState(false);
  const [clarificationDialogOpen, setClarificationDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailDialogTab, setDetailDialogTab] = useState("observacoes");

  const isFiscalAdministrativo =
    session?.user?.role === "FISCAL_ADMINISTRATIVO";
  const isFiscalTecnico = session?.user?.role === "FISCAL_TECNICO";
  const isOrdenador = session?.user?.role === "ORDENADOR_DESPESAS";

  const fiscalType: ChecklistType = isFiscalAdministrativo
    ? "ADMINISTRATIVA"
    : "TECNICA";

  useEffect(() => {
    loadChecklistItems();
  }, []);

  const loadChecklistItems = async () => {
    try {
      setLoading(true);
      const items = await getChecklistItems(contrato.id, fiscalType);
      setChecklistItems(items as unknown as ChecklistItemWithRelations[]);
    } catch (error) {
      console.error("Error loading checklist items:", error);
      toast.error("Erro ao carregar itens do checklist");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    itemId: string,
    status: ChecklistItemStatus,
  ) => {
    if (!session?.user?.id) return;

    const observation = newObservations[itemId] || "";
    if (status !== "PENDENTE" && !observation.trim()) {
      toast.error("Observação é obrigatória ao alterar o status");
      return;
    }

    try {
      await updateChecklistItem(itemId, status, observation, session.user.id);
      setNewObservations((prev) => ({ ...prev, [itemId]: "" }));
      await loadChecklistItems();
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleRequestClarification = async (itemId: string) => {
    if (!session?.user?.id) return;

    const question = newClarifications[itemId]?.trim();
    if (!question) {
      toast.error("Por favor, digite uma pergunta");
      return;
    }

    try {
      await requestClarification(itemId, question, session.user.id);
      setNewClarifications((prev) => ({ ...prev, [itemId]: "" }));
      await loadChecklistItems();
      toast.success("Esclarecimento solicitado com sucesso!");
    } catch (error) {
      toast.error("Erro ao solicitar esclarecimento");
    }
  };

  const handleAnswerClarification = async (esclarecimentoId: string) => {
    if (!session?.user?.id) return;

    const answer = newAnswers[esclarecimentoId]?.trim();
    if (!answer) {
      toast.error("Por favor, digite uma resposta");
      return;
    }

    try {
      await answerClarification(esclarecimentoId, answer, session.user.id);
      setNewAnswers((prev) => ({ ...prev, [esclarecimentoId]: "" }));
      await loadChecklistItems();
      toast.success("Esclarecimento respondido com sucesso!");
    } catch (error) {
      toast.error("Erro ao responder esclarecimento");
    }
  };

  const handleStatusDialogOpen = (item: ChecklistItemWithRelations) => {
    setSelectedItem(item);
    setSelectedStatus(item.status);
    setStatusDialogOpen(true);
  };

  const handleStatusDialogSave = async () => {
    if (!selectedItem || !session?.user?.id) return;

    const observation = newObservations[selectedItem.id] || "";
    if (selectedStatus !== "PENDENTE" && !observation.trim()) {
      toast.error("Observação é obrigatória ao alterar o status");
      return;
    }

    try {
      await updateChecklistItem(
        selectedItem.id,
        selectedStatus,
        observation,
        session.user.id,
      );
      setNewObservations((prev) => ({ ...prev, [selectedItem.id]: "" }));
      await loadChecklistItems();
      toast.success("Status atualizado com sucesso!");
      setStatusDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleObservationDialogOpen = (item: ChecklistItemWithRelations) => {
    setSelectedItem(item);
    setObservationDialogOpen(true);
  };

  const handleObservationDialogSave = async () => {
    if (!selectedItem || !session?.user?.id) return;

    const observation = newObservations[selectedItem.id] || "";
    if (!observation.trim()) {
      toast.error("Por favor, digite uma observação");
      return;
    }

    try {
      await updateChecklistItem(
        selectedItem.id,
        selectedItem.status,
        observation,
        session.user.id,
      );
      setNewObservations((prev) => ({ ...prev, [selectedItem.id]: "" }));
      await loadChecklistItems();
      toast.success("Observação adicionada com sucesso!");
      setObservationDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error("Erro ao adicionar observação");
    }
  };

  const handleClarificationDialogOpen = (item: ChecklistItemWithRelations) => {
    setSelectedItem(item);
    setClarificationDialogOpen(true);
  };

  const handleDetailDialogOpen = (item: ChecklistItemWithRelations) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };

  const getPendingClarifications = (item: ChecklistItemWithRelations) => {
    return item.esclarecimentos.filter((esc) => !esc.answer);
  };

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

  const formatDateTime = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("pt-BR");
  };

  const getStatusBadge = (vigenciaTermino: Date) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
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

  const getProgressPercentage = () => {
    const totalItems = checklistItems.length;
    if (totalItems === 0) return 0;
    const completedItems = checklistItems.filter(
      (item) => item.status !== "PENDENTE",
    ).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const getStatusBadgeForItem = (status: ChecklistItemStatus) => {
    switch (status) {
      case "CONFORME":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Conforme
          </Badge>
        );
      case "NAO_CONFORME":
        return <Badge variant="destructive">Não Conforme</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const handleGenerateReport = () => {
    // Transform checklistItems to match the legacy format expected by PDF generator
    const legacyChecklistData = checklistItems.map((item) => ({
      id: item.id,
      contratoId: item.contratoId,
      checklistId: item.checklistId,
      status: item.status,
      currentObservation: item.currentObservation,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      userId: null, // Legacy field, not used in new structure
      text: item.checklist.text, // Map from checklist relation
      type: item.checklist.type, // Map from checklist relation
      observacao: item.currentObservation, // Legacy field name
      itemIndex: 0, // Legacy field, not used anymore
      dataVerificacao: item.observationHistory[0]?.createdAt || null,
      verificadoPorId: item.observationHistory[0]?.user.id || null,
      esclarecimento: item.esclarecimentos[0]?.question || null,
      dataEsclarecimento: item.esclarecimentos[0]?.askedAt || null,
      resposta: item.esclarecimentos[0]?.answer || null,
      dataResposta: item.esclarecimentos[0]?.answeredAt || null,
      observationHistory: item.observationHistory,
    }));

    const reportData = {
      contrato,
      checklistData: legacyChecklistData,
      diaVerificacao: "",
      fiscalTipo: isFiscalAdministrativo
        ? ("administrativo" as const)
        : ("tecnico" as const),
    };

    downloadPDF(
      reportData,
      `relatorio_${contrato.numeroContrato.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
    );
    toast.success("Relatório gerado com sucesso!");
  };

  const handleSignReport = () => {
    // TODO: Implement sign report
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Carregando checklist...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/fiscais">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="font-semibold text-lg">Fiscalização do Contrato</h1>
          <p className="text-sm text-muted-foreground">
            {contrato.numeroContrato}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header do Contrato */}
          <ContratoHeader
            contrato={contrato}
            statusBadge={getStatusBadge(contrato.vigenciaTermino)}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />

          {/* Tabs */}
          <Tabs defaultValue="checklist" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="checklist">
                Checklist de Fiscalização
              </TabsTrigger>
              <TabsTrigger value="informacoes">
                Informações do Contrato
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checklist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {isFiscalAdministrativo
                      ? "Fiscalização Administrativa"
                      : "Fiscalização Técnica"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso do Checklist</span>
                      <span>{getProgressPercentage()}% completo</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                  </div>

                  {/* Checklist Table */}
                  <ChecklistTable
                    checklistItems={checklistItems}
                    getStatusBadgeForItem={getStatusBadgeForItem}
                    getPendingClarifications={getPendingClarifications}
                    isFiscalAdministrativo={isFiscalAdministrativo}
                    isFiscalTecnico={isFiscalTecnico}
                    isOrdenador={isOrdenador}
                    onStatusDialogOpen={handleStatusDialogOpen}
                    onObservationDialogOpen={handleObservationDialogOpen}
                    onClarificationDialogOpen={handleClarificationDialogOpen}
                    onDetailDialogOpen={handleDetailDialogOpen}
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4">
                    <Button variant="outline" onClick={handleGenerateReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                    <Button variant="outline" onClick={handleSignReport}>
                      <FileText className="h-4 w-4 mr-2" />
                      Assinar Relatório
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="informacoes" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações do Contrato */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informações do Contrato
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">
                          Processo Administrativo:
                        </span>
                        <p className="text-muted-foreground">
                          {contrato.processoAdministrativo}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Modalidade:</span>
                        <p className="text-muted-foreground">
                          {contrato.modalidadeLicitacao}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Data de Assinatura:</span>
                        <p className="text-muted-foreground">
                          {formatDate(contrato.dataAssinatura)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Valor Total:</span>
                        <p className="text-muted-foreground">
                          {formatCurrency(contrato.valorTotal)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informações da Contratada */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Informações da Contratada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Nome:</span>
                        <p className="text-muted-foreground">
                          {contrato.nomeContratada}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">CNPJ:</span>
                        <p className="text-muted-foreground">
                          {contrato.cnpjContratada}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">
                          Representante Legal:
                        </span>
                        <p className="text-muted-foreground">
                          {contrato.representanteLegal}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Endereço:</span>
                        <p className="text-muted-foreground">
                          {contrato.enderecoContratada}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Telefone:</span>
                        <p className="text-muted-foreground">
                          {contrato.telefoneContratada}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>
                        <p className="text-muted-foreground">
                          {contrato.emailContratada}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status</DialogTitle>
            <DialogDescription>
              Altere o status do item: {selectedItem?.checklist.text}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value: ChecklistItemStatus) =>
                  setSelectedStatus(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="CONFORME">Conforme</SelectItem>
                  <SelectItem value="NAO_CONFORME">Não Conforme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observação</Label>
              <Textarea
                placeholder="Descreva o que foi verificado..."
                value={
                  selectedItem ? newObservations[selectedItem.id] || "" : ""
                }
                onChange={(e) =>
                  selectedItem &&
                  setNewObservations((prev) => ({
                    ...prev,
                    [selectedItem.id]: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleStatusDialogSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Observation Dialog */}
      <Dialog
        open={observationDialogOpen}
        onOpenChange={setObservationDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Observação</DialogTitle>
            <DialogDescription>
              Adicione uma observação ao item: {selectedItem?.checklist.text}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Observação</Label>
              <Textarea
                placeholder="Digite sua observação..."
                value={
                  selectedItem ? newObservations[selectedItem.id] || "" : ""
                }
                onChange={(e) =>
                  selectedItem &&
                  setNewObservations((prev) => ({
                    ...prev,
                    [selectedItem.id]: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setObservationDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleObservationDialogSave}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog with Tabs */}
      {selectedItem && (
        <Dialog
          open={detailDialogOpen}
          onOpenChange={(open) => setDetailDialogOpen(open)}
        >
          <DialogContent className="h-[90vh] w-[90vw] sm:max-w-full overflow-y-auto flex flex-col">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg">
                {selectedItem.checklist.text}
              </DialogTitle>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground">
                  Status atual:
                </span>
                {getStatusBadgeForItem(selectedItem.status)}
              </div>
            </DialogHeader>

            <Tabs value={detailDialogTab} onValueChange={setDetailDialogTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="observacoes"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Observações ({selectedItem.observationHistory?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="esclarecimentos"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Esclarecimentos ({selectedItem.esclarecimentos?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="observacoes" className="mt-4 space-y-4">
                {selectedItem.observationHistory?.length ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedItem.observationHistory.map((obs: any) => (
                      <ObservationCard
                        key={obs.id}
                        obs={obs}
                        getStatusBadge={(status: string) =>
                          getStatusBadgeForItem(status as ChecklistItemStatus)
                        }
                        formatDate={(date: string | Date) =>
                          formatDateTime(new Date(date))
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Nenhuma observação registrada.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="esclarecimentos" className="mt-4 space-y-4">
                {selectedItem.esclarecimentos?.length ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedItem.esclarecimentos.map((esc: any) => (
                      <ClarificationCard
                        key={esc.id}
                        esc={esc}
                        formatDate={(date: string | Date) =>
                          formatDateTime(new Date(date))
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Nenhum esclarecimento solicitado.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Clarification Dialog */}
      <Dialog
        open={clarificationDialogOpen}
        onOpenChange={setClarificationDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isOrdenador
                ? "Solicitar Esclarecimento"
                : "Responder Esclarecimentos"}
            </DialogTitle>
            <DialogDescription>
              Item: {selectedItem?.checklist.text}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isOrdenador ? (
              <div className="space-y-2">
                <Label>Pergunta</Label>
                <Textarea
                  placeholder="Digite sua pergunta..."
                  value={
                    selectedItem ? newClarifications[selectedItem.id] || "" : ""
                  }
                  onChange={(e) =>
                    selectedItem &&
                    setNewClarifications((prev) => ({
                      ...prev,
                      [selectedItem.id]: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            ) : selectedItem &&
              getPendingClarifications(selectedItem).length === 0 ? (
              <div className="text-muted-foreground text-sm">
                Nenhum esclarecimento pendente.
              </div>
            ) : (
              selectedItem &&
              getPendingClarifications(selectedItem).map((esclarecimento) => (
                <div
                  key={esclarecimento.id}
                  className="space-y-3 p-4 border rounded-lg"
                >
                  <div>
                    <Label className="font-medium">Pergunta:</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {esclarecimento.question}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Por{" "}
                      {esclarecimento.askedBy.name ||
                        esclarecimento.askedBy.email}{" "}
                      em {formatDateTime(esclarecimento.askedAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Sua Resposta</Label>
                    <Textarea
                      placeholder="Digite sua resposta..."
                      value={newAnswers[esclarecimento.id] || ""}
                      onChange={(e) =>
                        setNewAnswers((prev) => ({
                          ...prev,
                          [esclarecimento.id]: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (newAnswers[esclarecimento.id]) {
                          await handleAnswerClarification(esclarecimento.id);
                          // Optionally reload checklist items to update the list
                          await loadChecklistItems();
                        }
                      }}
                      disabled={!newAnswers[esclarecimento.id]}
                    >
                      Responder
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClarificationDialogOpen(false)}
            >
              Fechar
            </Button>
            {isOrdenador && (
              <Button
                onClick={async () => {
                  if (isOrdenador && selectedItem) {
                    await handleRequestClarification(selectedItem.id);
                    setClarificationDialogOpen(false);
                  }
                }}
                disabled={
                  !selectedItem ||
                  !newClarifications[selectedItem.id] ||
                  newClarifications[selectedItem.id].trim() === ""
                }
              >
                Enviar Pergunta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
