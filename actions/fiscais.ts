"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ChecklistItemStatus, ChecklistType } from "@prisma/client";

// Get checklist questions based on fiscal type
export async function getChecklistQuestions(type: ChecklistType) {
  try {
    const questions = await prisma.checklist.findMany({
      where: { type },
      orderBy: { createdAt: "asc" },
    });
    return questions;
  } catch (error) {
    console.error("Error fetching checklist questions:", error);
    throw new Error("Failed to fetch checklist questions");
  }
}

// Get or create checklist items for a contract
export async function getChecklistItems(
  contratoId: string,
  fiscalType: ChecklistType
) {
  try {
    // Get all questions for this fiscal type
    const questions = await getChecklistQuestions(fiscalType);

    // Get existing checklist items for this contract and type
    const existingItems = await prisma.checklistItem.findMany({
      where: {
        contratoId,
        checklist: { type: fiscalType },
      },
      include: {
        checklist: true,
        observationHistory: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
        esclarecimentos: {
          include: {
            askedBy: true,
            answeredBy: true,
          },
          orderBy: { askedAt: "desc" },
        },
      },
    });

    // Create missing checklist items
    const existingChecklistIds = existingItems.map((item) => item.checklistId);
    const missingQuestions = questions.filter(
      (q) => !existingChecklistIds.includes(q.id)
    );

    for (const question of missingQuestions) {
      await prisma.checklistItem.create({
        data: {
          contratoId,
          checklistId: question.id,
          status: "PENDENTE",
        },
      });
    }

    // Fetch all items again with updated data
    const allItems = await prisma.checklistItem.findMany({
      where: {
        contratoId,
        checklist: { type: fiscalType },
      },
      include: {
        checklist: true,
        observationHistory: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
        esclarecimentos: {
          include: {
            askedBy: true,
            answeredBy: true,
          },
          orderBy: { askedAt: "desc" },
        },
      },
      orderBy: { checklist: { createdAt: "asc" } },
    });

    return allItems;
  } catch (error) {
    console.error("Error fetching checklist items:", error);
    throw new Error("Failed to fetch checklist items");
  }
}

// Update checklist item status and add observation
export async function updateChecklistItem(
  itemId: string,
  status: ChecklistItemStatus,
  observation: string,
  userId: string
) {
  try {
    // Update the checklist item
    const updatedItem = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        status,
        currentObservation: observation,
        updatedAt: new Date(),
      },
    });

    // Add to observation history
    await prisma.observationHistory.create({
      data: {
        checklistItemId: itemId,
        status,
        observation,
        userId,
      },
    });

    revalidatePath("/fiscais");
    return updatedItem;
  } catch (error) {
    console.error("Error updating checklist item:", error);
    throw new Error("Failed to update checklist item");
  }
}

// Request clarification for a checklist item
export async function requestClarification(
  itemId: string,
  question: string,
  askedById: string
) {
  try {
    const esclarecimento = await prisma.esclarecimento.create({
      data: {
        checklistItemId: itemId,
        question,
        askedById,
      },
    });

    // Get the checklist item to find who should be notified
    const checklistItem = await prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: {
        contrato: true,
        checklist: true,
      },
    });

    if (checklistItem) {
      // Find fiscal users to notify based on checklist type
      const fiscalRole =
        checklistItem.checklist.type === "ADMINISTRATIVA"
          ? "FISCAL_ADMINISTRATIVO"
          : "FISCAL_TECNICO";

      const fiscalsToNotify = await prisma.user.findMany({
        where: { role: fiscalRole, isActive: true },
      });

      // Create notifications for fiscals
      for (const fiscal of fiscalsToNotify) {
        await prisma.notification.create({
          data: {
            userId: fiscal.id,
            esclarecimentoId: esclarecimento.id,
            type: "ESCLARECIMENTO_PEDIDO",
          },
        });
      }
    }

    revalidatePath("/fiscais");
    revalidatePath("/ordenador-despesas");
    return esclarecimento;
  } catch (error) {
    console.error("Error requesting clarification:", error);
    throw new Error("Failed to request clarification");
  }
}

// Answer clarification request
export async function answerClarification(
  esclarecimentoId: string,
  answer: string,
  answeredById: string
) {
  try {
    const esclarecimento = await prisma.esclarecimento.update({
      where: { id: esclarecimentoId },
      data: {
        answer,
        answeredById,
        answeredAt: new Date(),
      },
      include: {
        askedBy: true,
        checklistItem: {
          include: { contrato: true },
        },
      },
    });

    // Notify the person who asked the question
    await prisma.notification.create({
      data: {
        userId: esclarecimento.askedById,
        esclarecimentoId: esclarecimento.id,
        type: "ESCLARECIMENTO_RESPONDIDO",
      },
    });

    revalidatePath("/fiscais");
    revalidatePath("/ordenador-despesas");
    return esclarecimento;
  } catch (error) {
    console.error("Error answering clarification:", error);
    throw new Error("Failed to answer clarification");
  }
}

// Get notifications for a user
export async function getUserNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        checklistItem: {
          include: {
            checklist: true,
            contrato: true,
          },
        },
        esclarecimento: {
          include: {
            checklistItem: {
              include: {
                checklist: true,
                contrato: true,
              },
            },
            askedBy: true,
            answeredBy: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    revalidatePath("/fiscais");
    revalidatePath("/ordenador-despesas");
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read");
  }
}

// Legacy function for backward compatibility - to be removed later
export async function saveChecklistData(
  contratoId: string,
  checklistData: any[]
) {
  console.warn(
    "saveChecklistData is deprecated. Use updateChecklistItem instead."
  );
  // This function is kept for backward compatibility but should be replaced
  return true;
}

// Legacy function for backward compatibility - to be removed later
export async function getChecklistData(contratoId: string) {
  console.warn(
    "getChecklistData is deprecated. Use getChecklistItems instead."
  );
  // This function is kept for backward compatibility but should be replaced
  return [];
}

// Get contracts assigned to a fiscal user
export async function getContratosByFiscal(
  userId: string,
  userRole: string,
  search?: string
) {
  try {
    const where: any = {};
    const fiscalConditions: any[] = [];

    if (userRole === "FISCAL_ADMINISTRATIVO") {
      fiscalConditions.push({ fiscalAdministrativoId: userId });
    } else if (userRole === "FISCAL_TECNICO") {
      fiscalConditions.push({ fiscalTecnicoId: userId });
    } else {
      return [];
    }

    if (search?.trim()) {
      const searchTerm = search.trim();
      where.AND = [
        { OR: fiscalConditions },
        {
          OR: [
            { numeroContrato: { contains: searchTerm, mode: "insensitive" } },
            { objeto: { contains: searchTerm, mode: "insensitive" } },
            { nomeContratada: { contains: searchTerm, mode: "insensitive" } },
            { orgaoContratante: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      ];
    } else {
      where.OR = fiscalConditions;
    }

    const contratos = await prisma.contrato.findMany({
      where,
      include: {
        fiscalAdministrativo: {
          select: { id: true, name: true, email: true },
        },
        fiscalTecnico: {
          select: { id: true, name: true, email: true },
        },
        fiscalSubstituto: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { vigenciaTermino: "asc" },
    });

    return contratos;
  } catch (error) {
    console.error("Error fetching contracts by fiscal:", error);
    throw new Error("Failed to fetch contracts by fiscal");
  }
}

// Get contract by ID for fiscal view
export async function getContratoByIdForFiscal(
  contratoId: string,
  userId: string,
  userRole: string
) {
  try {
    const contrato = await prisma.contrato.findUnique({
      where: { id: contratoId },
      include: {
        fiscalAdministrativo: {
          select: { id: true, name: true, email: true },
        },
        fiscalTecnico: {
          select: { id: true, name: true, email: true },
        },
        fiscalSubstituto: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!contrato) {
      return null;
    }

    // Check if fiscal has access to this contract
    if (userRole === "FISCAL_ADMINISTRATIVO") {
      if (contrato.fiscalAdministrativoId !== userId) {
        return null;
      }
    } else if (userRole === "FISCAL_TECNICO") {
      if (contrato.fiscalTecnicoId !== userId) {
        return null;
      }
    }

    return contrato;
  } catch (error) {
    console.error("Error fetching contract by ID for fiscal:", error);
    throw new Error("Failed to fetch contract for fiscal");
  }
}

// Get all fiscais (administrative and technical)
export async function getAllFiscais() {
  return await prisma.user.findMany({
    where: {
      role: {
        in: ["FISCAL_ADMINISTRATIVO", "FISCAL_TECNICO"],
      },
      isActive: true,
      deletedAt: null,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      whatsapp: true,
    },
  });
}
