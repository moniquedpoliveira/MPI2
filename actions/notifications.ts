"use server";

import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import ContractUpdateNotification from "../../email/notification";
import * as React from "react";

export const sendEmail = async (email: string, message: string) => {
  const result = await resend.emails.send({
    from: "Lícito <no-reply@email.pxel.com.br>",
    to: email,
    subject: "Lícito - Notificação",
    html: `<p>${message}</p>`,
  });

  return result;
};

export const notifyContractResponsibles = async (
  numeroContrato: string,
  updateDescription: string,
  actionRequired: string,
  updateType = "Notificação de Contrato"
) => {
  const contract = await prisma.contrato.findUnique({
    where: { numeroContrato },
    include: {
      fiscalAdministrativo: {
        select: { name: true, email: true },
      },
      fiscalTecnico: {
        select: { name: true, email: true },
      },
    },
  });

  if (!contract) {
    console.error(`Contrato ${numeroContrato} não encontrado.`);
    return { success: false, message: "Contrato não encontrado." };
  }

  const emails = [
    contract.emailGestor,
    contract.emailFiscalAdm,
    contract.emailFiscalTec,
  ].filter((email): email is string => !!email);

  if (emails.length === 0) {
    console.warn(
      `Não foram encontrados emails de responsáveis para o contrato ${numeroContrato}.`
    );
    return {
      success: false,
      message: "Emails de responsáveis não encontrados.",
    };
  }

  const uniqueEmails = [...new Set(emails)];

  const fiscais =
    [contract.fiscalAdministrativo?.name, contract.fiscalTecnico?.name]
      .filter(Boolean)
      .join(", ") || "Não informado";

  const systemLink = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/contratos/${contract.id}`
    : "#";

  const props = {
    contractNumber: contract.numeroContrato,
    contractTitle: contract.objeto,
    supplier: contract.nomeContratada,
    manager: contract.gestorContrato,
    inspector: fiscais,
    updateType,
    updateDescription,
    effectiveDate: new Date().toLocaleDateString("pt-BR"),
    contractValue: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(contract.valorTotal),
    status: contract.vigenciaTermino > new Date() ? "Vigente" : "Encerrado",
    actionRequired,
    dueDate: "",
    systemLink,
  };

  try {
    const data = await resend.emails.send({
      from: "Lícito <no-reply@email.pxel.com.br>",
      to: uniqueEmails,
      subject: `Lícito - ${updateType}: ${contract.numeroContrato}`,
      react: React.createElement(ContractUpdateNotification, props),
    });

    return { success: true, message: "Emails de notificação enviados." };
  } catch (error) {
    console.error("Erro ao enviar email de notificação:", error);
    return { success: false, message: "Erro ao enviar emails de notificação." };
  }
};

const whatsappUrlEndpoint =
  "https://whats.odesertor.com/message/sendText/VitorLebre";

const buildMessageBody = (phone: string, message: string) => {
  return JSON.stringify({
    number: phone,
    text: message,
    options: {
      delay: 1200,
      presence: "composing",
    },
  });
};

export const sendWhatsappMessage = async (phone: string, message: string) => {
  try {
    //Verify if number has +55 prefix
    if (!phone.startsWith("55")) {
      phone = `55${phone}`;
    }

    const options = createRequestOptions(phone, message);
    const response = await fetch(whatsappUrlEndpoint, options);

    return await handleResponse(response);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return { success: false, message: "Erro ao enviar mensagem." };
  }
};

const createRequestOptions = (phone: string, message: string) => {
  return {
    method: "POST",
    headers: {
      apikey: "Mwhg0f9fc1aaE2VmV0WGBSgdUafIwAIl",
      "Content-Type": "application/json",
    },
    body: buildMessageBody(phone, message),
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 201) {
    return { success: true, message: "Mensagem enviada com sucesso." };
  }

  console.log("Response: ", response);
  const data = await response.json();
  console.log("Data: ", data);
  return { success: false, message: "Erro ao enviar mensagem." };
};

const buildWhatsappNotificationMessage = (
  contract: { numeroContrato: string; objeto: string; id: string },
  updateType: string,
  updateDescription: string,
  actionRequired: string
): string => {
  const systemLink = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/contratos/${contract.id}`
    : "Link para o sistema não disponível";

  const messageParts = [
    `*🔔 Notificação de Atualização Contratual*`,
    `O contrato *${contract.numeroContrato}* (${contract.objeto}) teve uma atualização.`,
    ``,
    `*Tipo de Atualização:*`,
    `${updateType}`,
    ``,
    `*Descrição:*`,
    `${updateDescription}`,
    ``,
    `*Ação Necessária:*`,
    `${actionRequired}`,
    ``,
    `Para mais detalhes, acesse o sistema:`,
    `${systemLink}`,
    ``,
    `---`,
    `_Esta é uma mensagem automática, por favor não responda._`,
  ];

  return messageParts.join("\n");
};

export const notifyContractResponsiblesByWhatsapp = async (
  numeroContrato: string,
  updateDescription: string,
  actionRequired: string,
  updateType = "Notificação de Contrato"
) => {
  const contract = await prisma.contrato.findUnique({
    where: { numeroContrato },
    include: {
      fiscalAdministrativo: {
        select: { name: true, whatsapp: true },
      },
      fiscalTecnico: {
        select: { name: true, whatsapp: true },
      },
    },
  });

  if (!contract) {
    console.error(`Contrato ${numeroContrato} não encontrado.`);
    return { success: false, message: "Contrato não encontrado." };
  }

  const phoneNumbers = [
    contract.telefoneGestor,
    contract.fiscalAdministrativo?.whatsapp,
    contract.fiscalTecnico?.whatsapp,
    contract.telefoneFiscalAdm, // Keep legacy field as fallback
    contract.telefoneFiscalTec, // Keep legacy field as fallback
  ].filter((phone): phone is string => !!phone && phone.trim() !== "");

  if (phoneNumbers.length === 0) {
    console.warn(
      `Não foram encontrados números de telefone de responsáveis para o contrato ${numeroContrato}.`
    );
    return {
      success: false,
      message: "Números de telefone de responsáveis não encontrados.",
    };
  }

  const uniquePhoneNumbers = [...new Set(phoneNumbers)];

  const message = buildWhatsappNotificationMessage(
    contract,
    updateType,
    updateDescription,
    actionRequired
  );

  const results = [];
  for (const phone of uniquePhoneNumbers) {
    const result = await sendWhatsappMessage(phone, message);
    results.push({ phone, ...result });
  }

  const allSuccess = results.every((r) => r.success);

  if (allSuccess) {
    return {
      success: true,
      message: "Mensagens de WhatsApp enviadas com sucesso.",
    };
  }

  return {
    success: false,
    message: "Algumas mensagens de WhatsApp não puderam ser enviadas.",
    results,
  };
};
