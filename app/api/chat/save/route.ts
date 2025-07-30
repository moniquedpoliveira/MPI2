import { NextResponse } from 'next/server'
import { saveMessage } from '@/lib/db/chat'
import { Message } from 'ai'

export async function POST(req: Request) {
  try {
    const { chatId, message } = await req.json()

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await saveMessage(chatId, message)

    return NextResponse.json({
      success: true,
      saved: result !== null,
      messageId: message.id
    })
  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    )
  }
} 