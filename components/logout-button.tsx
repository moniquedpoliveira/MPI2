"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="w-full justify-start text-gray-300 hover:text-white hover:bg-zinc-800"
    >
      <LogOut className="h-4 w-4 mr-2" />
      <span>Sair</span>
    </Button>
  );
}
