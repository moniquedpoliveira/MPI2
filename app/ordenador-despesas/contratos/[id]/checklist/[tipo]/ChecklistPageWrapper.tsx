"use client";

import { useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { ChecklistTableClient } from "./ChecklistTableClient";

interface ChecklistPageWrapperProps {
  checklistItems: any[];
  contrato: any;
  tipo: string;
  id: string;
}

export function ChecklistPageWrapper({
  checklistItems,
  contrato,
  tipo,
  id,
}: ChecklistPageWrapperProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <SessionProvider>
      <ChecklistTableClient
        checklistItems={checklistItems}
        contrato={contrato}
        tipo={tipo}
        id={id}
        onRefresh={handleRefresh}
      />
    </SessionProvider>
  );
}
