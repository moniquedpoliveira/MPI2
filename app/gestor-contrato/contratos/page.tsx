import { getContratosFiltered } from "@/actions/contratos";
import { ContratosClient } from "./contratos-client";

export default async function ContratosPage() {
  const initialContratos = await getContratosFiltered();

  return <ContratosClient initialContratos={initialContratos} />;
}
