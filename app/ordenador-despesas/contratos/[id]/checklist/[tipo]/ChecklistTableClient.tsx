"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { requestClarification } from "@/actions/fiscais";
import { useSession } from "next-auth/react";
import { ObservationCard } from "./ObservationCard";
import { ClarificationCard } from "./ClarificationCard";

interface ChecklistTableClientProps {
  checklistItems: any[];
  contrato: any;
  tipo: string;
  id: string;
  onRefresh?: () => void;
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status: string) => {
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
      return <Badge variant="secondary">Pendente</Badge>;
  }
};

export function ChecklistTableClient({
  checklistItems,
  contrato,
  tipo,
  id,
  onRefresh,
}: ChecklistTableClientProps) {
  const { data: session } = useSession();
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const [openClarifyId, setOpenClarifyId] = useState<string | null>(null);
  const [tab, setTab] = useState("observacoes");
  const [clarificationText, setClarificationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItem = checklistItems.find((item) => item.id === openDetailId);
  const clarifyItem = checklistItems.find((item) => item.id === openClarifyId);

  const handleSubmitClarification = async () => {
    if (!clarificationText.trim()) {
      toast.error("Por favor, digite uma pergunta");
      return;
    }

    if (!openClarifyId) {
      toast.error("Item não identificado");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsSubmitting(true);

    try {
      await requestClarification(
        openClarifyId,
        clarificationText.trim(),
        session.user.id
      );

      toast.success("Esclarecimento solicitado com sucesso!");
      setOpenClarifyId(null);
      setClarificationText("");

      // Refresh data if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error requesting clarification:", error);
      toast.error("Erro ao solicitar esclarecimento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseClarificationDialog = () => {
    setOpenClarifyId(null);
    setClarificationText("");
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pergunta</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead>Esclarecimentos</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checklistItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Nenhum item de checklist encontrado para este fiscal.
              </TableCell>
            </TableRow>
          )}
          {checklistItems.map((item: any) => (
            <TableRow
              key={item.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setOpenDetailId(item.id)}
            >
              <TableCell className="max-w-md">
                <p className="font-medium">{item.checklist.text}</p>
              </TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>
                <span className="text-sm">
                  {item.observationHistory?.length || 0}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {item.esclarecimentos?.length || 0}
                </span>
              </TableCell>
              <TableCell
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenClarifyId(item.id);
                }}
              >
                <Button size="sm" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Solicitar esclarecimento
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog for details (history/clarifications) */}
      {selectedItem && (
        <Dialog
          open={openDetailId === selectedItem.id}
          onOpenChange={(open) =>
            setOpenDetailId(open ? selectedItem.id : null)
          }
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
                {getStatusBadge(selectedItem.status)}
              </div>
            </DialogHeader>

            <Tabs value={tab} onValueChange={setTab}>
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
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
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
                        formatDate={formatDate}
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

      {/* Dialog for requesting clarification */}
      {clarifyItem && (
        <Dialog
          open={openClarifyId === clarifyItem.id}
          onOpenChange={handleCloseClarificationDialog}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Solicitar Esclarecimento</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Para:</p>
                  <p className="text-sm text-muted-foreground">
                    {tipo === "administrativo"
                      ? "Fiscal Administrativo"
                      : "Fiscal Técnico"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Contrato:</p>
                  <p className="text-sm text-muted-foreground">
                    {contrato.numeroContrato}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Item do checklist:</p>
                  <p className="text-sm text-muted-foreground border rounded p-2 bg-muted/30">
                    {clarifyItem.checklist.text}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clarification-question">
                  Sua pergunta <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="clarification-question"
                  placeholder="Descreva sua dúvida ou solicite esclarecimentos sobre este item..."
                  value={clarificationText}
                  onChange={(e) => setClarificationText(e.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Seja específico em sua pergunta para obter uma resposta mais
                  precisa.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleCloseClarificationDialog}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitClarification}
                disabled={
                  isSubmitting ||
                  !clarificationText.trim() ||
                  !session?.user?.id
                }
              >
                {isSubmitting ? "Enviando..." : "Enviar Esclarecimento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
