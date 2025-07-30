"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { solicitarEsclarecimentos } from "@/actions/esclarecimentos";

interface SolicitarEsclarecimentosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contratoId: string;
  contratoNumero: string;
  fiscalTipo: "administrativo" | "tecnico" | null;
}

export function SolicitarEsclarecimentosDialog({
  open,
  onOpenChange,
  contratoId,
  contratoNumero,
  fiscalTipo,
}: SolicitarEsclarecimentosDialogProps) {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const getFiscalLabel = () => {
    return fiscalTipo === "administrativo"
      ? "Fiscal Administrativo"
      : "Fiscal Técnico";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mensagem.trim()) {
      toast.error("Por favor, insira uma mensagem");
      return;
    }

    if (!fiscalTipo) {
      toast.error("Tipo de fiscal não identificado");
      return;
    }

    setLoading(true);

    try {
      await solicitarEsclarecimentos({
        contratoId,
        fiscalTipo,
        mensagem,
      });

      toast.success("Solicitação de esclarecimentos enviada com sucesso!");
      onOpenChange(false);
      setMensagem("");
    } catch (error) {
      toast.error("Erro ao enviar solicitação de esclarecimentos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Solicitar Esclarecimentos</DialogTitle>
          <DialogDescription>
            Envie uma solicitação de esclarecimentos para o {getFiscalLabel()}{" "}
            do contrato {contratoNumero}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              placeholder="Descreva os esclarecimentos necessários..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={5}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
