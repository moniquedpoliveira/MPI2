"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function solicitarEsclarecimentos(data: {
  contratoId: string;
  fiscalTipo: 'administrativo' | 'tecnico';
  mensagem: string;
}) {
  // Por enquanto, vamos apenas simular o envio da solicitação
  // Em uma implementação real, isso poderia enviar email, notificação push, etc.

  console.log('Solicitação de esclarecimentos:', {
    contratoId: data.contratoId,
    fiscalTipo: data.fiscalTipo,
    mensagem: data.mensagem,
    timestamp: new Date().toISOString()
  });

  // Aqui você poderia:
  // 1. Salvar a solicitação no banco de dados
  // 2. Enviar email para o fiscal
  // 3. Enviar notificação push
  // 4. Registrar no log de atividades

  revalidatePath('/ordenador-despesas');

  return { success: true };
}

export async function getEsclarecimentos(contratoId: string) {
  // Por enquanto retorna um array vazio
  // Em uma implementação real, isso buscaria as solicitações do banco
  return [];
} 