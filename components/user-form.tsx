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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@prisma/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    whatsapp?: string;
  };
  onSubmit: (data: {
    name: string;
    email: string;
    password?: string;
    role: string;
    whatsapp?: string;
  }) => Promise<void>;
}

export function UserForm({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "GESTOR_CONTRATO",
    whatsapp: "",
  });

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "GESTOR_CONTRATO",
        whatsapp: user.whatsapp || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "GESTOR_CONTRATO",
        whatsapp: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      toast.success(
        user
          ? "Usuário atualizado com sucesso!"
          : "Usuário criado com sucesso!",
      );
      onOpenChange(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "GESTOR_CONTRATO",
        whatsapp: "",
      });
    } catch (error) {
      toast.error("Erro ao salvar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuário" : "Adicionar Usuário"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Edite as informações do usuário"
              : "Preencha as informações do novo usuário"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!user}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Perfil</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as UserRole })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                <SelectItem value="GESTOR_CONTRATO">
                  Gestor de Contrato
                </SelectItem>
                <SelectItem value="FISCAL_ADMINISTRATIVO">
                  Fiscal Administrativo
                </SelectItem>
                <SelectItem value="FISCAL_TECNICO">Fiscal Técnico</SelectItem>
                <SelectItem value="ORDENADOR_DESPESAS">
                  Ordenador de Despesas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, whatsapp: e.target.value })
              }
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
              {loading ? "Salvando..." : user ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
