import { notifyContractResponsibles, sendWhatsappMessage } from '@/actions/notifications';
import { generateQuery } from '@/lib/sql-query-builder';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import z from 'zod';
import { Client } from 'pg';


export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: messages,
      system: `Você é um assistente de IA para gerenciamento de contratos.

      Suas capacidades incluem:
      
      1. Obter informações sobre Contratos ('getInformationAboutContract').
      2. Enviar notificações por email ('sendEmail').
      3. Enviar notificações por WhatsApp ('sendWhatsappMessage').
      4. Obter o link do GPT para suporte adicional ('getGPTLink').
      5. Caso nao tenha a resposta para a pergunta, você pode pedir os dados necessários para responder a pergunta ('queryAnyData').
      
      Você SÓ PODE usar as ferramentas fornecidas para essas funcionalidades.
      
      Se o usuário solicitar algo fora dessas capacidades, recuse educadamente explicando suas limitações.
      
      Caso uma busca não retorne contratos, informe claramente que nenhum contrato foi encontrado.
      
      Sempre priorize escrever com espaçamento e legibilidade. Organize o máximo possível as informações para ser fácil de ler.

      Quando as tools derem muitas informações, organize-as e reduza a somente as informações necessárias e importantes.
      
      `
      ,
      tools: {
        getGPTLink: tool({
          description: "Obtém o link do GPT que auxilia a gestão do contrato. Utilizado para responder perguntas mais gerais sobre o contrato que não sejam específicas sobre o contrato em si.",
          parameters: z.object({}),
          execute: async () => { return { success: true, message: "Link do GPT obtido com sucesso.", data: { link: "https://chat.openai.com/g/g-1234567890" } } }
        }),
        sendEmail: tool({
          description: "Envia um email para o contrato. Também chamado de notificação por email. Utilizado para notificar os responsáveis pelo contrato sobre uma atualização do contrato.",
          parameters: z.object({
            contractNumber: z.string().describe("O número do contrato para o qual o email será enviado."),
            updateDescription: z.string().describe("A descrição da atualização do contrato."),
            actionRequired: z.string().describe("A ação requerida para a atualização do contrato."),
            updateType: z.string().describe("O tipo de atualização do contrato."),
          }),
          execute: async ({ contractNumber, updateDescription, actionRequired, updateType }) => {
            try {
              console.log(`Tool: sendEmail called with contractNumber ${contractNumber}, updateDescription ${updateDescription}, actionRequired ${actionRequired}, updateType ${updateType}`)
              const result = await notifyContractResponsibles(contractNumber, updateDescription, actionRequired, updateType)
              return { success: true, message: "Email enviado com sucesso.", data: { contractNumber, updateDescription, actionRequired, updateType, result } }
            } catch (e: any) {
              return { success: false, message: `Erro ao enviar email: ${e.message}`, data: { contractNumber, updateDescription, actionRequired, updateType } }
            }
          }
        }),
        sendWhatsappMessage: tool({
          description: "Envia uma mensagem para o contrato via WhatsApp. Também chamado de notificação por WhatsApp.",
          parameters: z.object({
            message: z.string().describe("A mensagem a ser enviada."),
            phone: z.string().describe("O número de telefone para o qual a mensagem será enviada."),
          }),
          execute: async ({ message, phone }) => {
            try {
              console.log(`Tool: sendWhatsappMessage called with message ${message} and phone ${phone}`)
              const result = await sendWhatsappMessage(phone, message)
              return { success: true, message: "Mensagem enviada com sucesso.", data: { message, phone, result } }
            } catch (e: any) {
              return { success: false, message: `Erro ao enviar mensagem: ${e.message}`, data: { message, phone } }
            }
          },
        }),
        getInformationAboutContract: tool({
          description: "Executa uma consulta SQL arbitrária. Utilizado para responder perguntas que não sejam específicas sobre o contrato em si.",
          parameters: z.object({
            input: z.string().describe("Um frase para explicar quais dados o usuário necessita saber."),
          }),
          execute: async ({ input }) => {
            console.log(`Tool: getInformationAboutContract called with input ${input}`)
            const result = (await generateQuery(input)) as string;

            try {
              console.log("Executing generated SQL query:", result);

              const client = new Client({
                connectionString: process.env.DATABASE_URL,
              });

              await client.connect();

              const queryResult = await client.query(
                result
              );

              await client.end();

              return {
                success: true,
                message: "Consulta SQL executada com sucesso.",
                data: { result: queryResult.rows }
              };
            } catch (e: any) {
              console.error(`Erro ao executar consulta SQL: ${e.message}`, { query: result });
              return { success: false, message: `Erro ao executar consulta SQL: ${e.message}`, data: { query: result } }
            }

          }
        }),
      }, // End of tools
    }) // End of streamText
    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("Unhandled error in submitUserMessage Server Action:", error)
    throw error // Re-throw to be handled by Next.js/AI SDK client
  }
}