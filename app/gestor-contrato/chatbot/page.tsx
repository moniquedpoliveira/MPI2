"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createChat } from "@/lib/db/chat"
import { MultimodalInput } from "@/components/multimodal"
import { WelcomeMessage } from "@/components/welcome-message"
import { useQueryClient } from "@tanstack/react-query"

export default function ChatbotPage() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const createNewChat = async (input: string) => {
    setIsLoading(true)
    const chat = await createChat(input)
    router.push(`/chatbot/${chat.id}?prompt=${input}`)
    queryClient.invalidateQueries({ queryKey: ["chats"] })
    setIsLoading(false)
  }


  // Show loading while redirecting
  return (
    <div className="flex h-screen flex-col items-center justify-center  bg-background ">
        <div className="p-4 -mt-36">
          <WelcomeMessage />
      </div>
      <div className="">
        
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (input.trim()) {
                // handleSubmit(e)
              }
            }}
            >
            <MultimodalInput
              stop={() => {}}
              input={input}
              hasSuggestedActions
              setInput={(value) => setInput(value)}
              isLoading={isLoading}
              messages={[]}
              append={() => {
                console.log("append")
                return Promise.resolve(null)
              }}
              createNewChat={createNewChat}
              handleSubmit={async () => {
                await createNewChat(input)
              }}
              />
          </form>
        </div>
      </div>
              </div>
  )
} 