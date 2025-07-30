"use server"
import { prisma } from "@/lib/prisma"
import { openai } from "@ai-sdk/openai"
import { type Message, generateText } from "ai"

export async function createChat(prompt?: string) {
  const generatedTitle = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `
    You are a helpful assistant that generates titles for chat conversations.
    The title should be a single sentence that captures the main topic of the conversation.
    The title should be no more than 10 words.
    The title should be in Portuguese. 

    Here is the prompt: ${prompt || "Nova Conversa"}
    `,
    maxTokens: 100,
  })
  return await prisma.chat.create({
    data: {
      title: generatedTitle.text
    }
  })
}

export async function getChat(id: string) {
  return await prisma.chat.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })
}

export async function saveMessage(chatId: string, message: Message) {
  if (!message.id || !chatId) {
    throw new Error('Missing required fields: message ID or chat ID')
  }

  try {
    return await prisma.message.create({
      data: {
        id: message.id,
        role: message.role,
        content: message.content || null,
        toolInvocations: message.parts ? JSON.stringify(message.parts) : undefined,
        chatId
      }
    })
  } catch (error) {
    if ((error as any)?.code === 'P2002') {
      console.log(`Message ${message.id} already exists, skipping save`)
      return null
    }
    throw error
  }
}

export async function saveMessages(chatId: string, messages: Message[]) {
  const lastMessage = messages[messages.length - 1]
  return await saveMessage(chatId, lastMessage)
}

export async function getMessages(chatId: string) {
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' }
  })

  return messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content || '',
    toolInvocations: msg.toolInvocations ? JSON.parse(msg.toolInvocations as string) : undefined
  }))
}

export async function getAllChats() {
  return await prisma.chat.findMany({
    orderBy: {
      updatedAt: 'desc'
    },
    include: {
      messages: {
        take: 1,
        orderBy: {
          createdAt: 'asc'
        },
        where: {
          role: 'user'
        }
      }
    }
  })
} 