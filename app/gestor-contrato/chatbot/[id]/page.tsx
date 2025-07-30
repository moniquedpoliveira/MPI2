"use client";

import type { Message } from "@ai-sdk/react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Hammer, ChevronUp } from "lucide-react";
import { useEffect, useRef, memo, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { MultimodalInput } from "@/components/multimodal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconRobot } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getMessages } from "@/lib/db/chat";
import { useRouterStuff } from "@/hooks/use-router-stuffs";

// Separate interface for better type safety
interface ChatMessage extends Message {
  id: string;
  role: "user" | "assistant" | "data";
  content: string;
  parts?: any[];
}

const ToolCall = ({ toolInvocation }: { toolInvocation: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log("toolInvocation", toolInvocation);
  // Guard against invalid or incomplete toolInvocation objects
  if (!toolInvocation?.toolName) {
    return null;
  }

  const title = toolInvocation.toolName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
  const { type } = toolInvocation;
  const hasArgs =
    toolInvocation.args && Object.keys(toolInvocation.args).length > 0;

  if (toolInvocation.state === "call") {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Pensando...</span>
        </div>
      </div>
    );
  }

  return null;

  // return (
  //   <Collapsible
  //     open={isOpen}
  //     onOpenChange={setIsOpen}
  //     className="rounded-md -mt-2 mb-4"
  //   >
  //     <div className="flex items-center justify-between bg-muted rounded-md border-2 px-4 py-2">
  //       <div className="flex items-center gap-2 rounded-md">
  //         <span className="text-sm font-semibold">Ação Executada</span>
  //       </div>
  //       {hasArgs && (
  //         <CollapsibleTrigger asChild>
  //           <button className="text-sm cursor-pointer">
  //             <div className="flex items-center">
  //               <span>Detalhes</span>
  //               <ChevronUp
  //                 size={16}
  //                 className={`ml-1 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
  //               />
  //             </div>
  //           </button>
  //         </CollapsibleTrigger>
  //       )}
  //     </div>
  //     {hasArgs && (
  //       <CollapsibleContent>
  //         <div className="mt-4 rounded-md border">
  //           <div className="flex items-center justify-between border-b bg-muted p-2 px-4">
  //             <p className="text-sm font-medium">
  //               O seguinte conteúdo foi compartilhado:
  //             </p>
  //           </div>
  //           <div className="space-y-2 p-2 px-4">
  //             {Object.entries(toolInvocation.args).map(([key, value]) => (
  //               <div key={key} className="flex items-start">
  //                 <span className="w-24 shrink-0 text-sm font-semibold text-muted-foreground">
  //                   {key}:
  //                 </span>
  //                 <span className="text-sm">"{String(value)}"</span>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </CollapsibleContent>
  //     )}
  //   </Collapsible>
  // );
};

const ChatMessage = memo(({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 p-2"
    >
      <Avatar className="h-8 w-8 shrink-0 self-start">
        <AvatarFallback>
          {isUser ? (
            <User size={18} />
          ) : message.role === "assistant" ? (
            <Bot size={18} />
          ) : (
            <Hammer size={18} />
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 pt-1 text-sm space-y-2">
        {/* Render tool invocation parts first, as they happen before the final content */}
        {message.parts?.map((part, index) => {
          if (part.type === "tool-invocation") {
            return (
              <ToolCall
                key={part.toolInvocation.toolCallId ?? index}
                toolInvocation={part.toolInvocation}
              />
            );
          }

          console.log(part);
          return null;
        })}

        {/* Render aggregated text content. `useChat` streams text parts into this. */}
        {message.content ? (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        ) : null}
      </div>
    </motion.div>
  );
});
ChatMessage.displayName = "ChatMessage";

// Custom hook for message persistence following Single Responsibility Principle
const useMessagePersistence = (chatId: string) => {
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(
    new Set(),
  );

  const saveMessage = useCallback(
    async (message: Message) => {
      if (!message.id || savedMessageIds.has(message.id)) {
        return false;
      }

      try {
        const response = await fetch("/api/chat/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, message }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setSavedMessageIds((prev) => new Set(prev).add(message.id));
          return true;
        }

        console.error("Failed to save message:", result.error);
        return false;
      } catch (error) {
        console.error("Failed to save message:", error);
        return false;
      }
    },
    [chatId, savedMessageIds],
  );

  const markAsSaved = useCallback((messageIds: string[]) => {
    setSavedMessageIds((prev) => {
      const newSet = new Set(prev);
      for (const id of messageIds) {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  return { saveMessage, markAsSaved, savedMessageIds };
};

// Custom hook for message loading following Single Responsibility Principle
const useMessageLoader = (chatId: string) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadMessages = useCallback(async (): Promise<ChatMessage[]> => {
    if (!chatId || isLoaded) return [];

    try {
      const existingMessages = await getMessages(chatId);
      setIsLoaded(true);
      return existingMessages.map((msg) => {
        const dbData = msg.toolInvocations; // This field stores either `parts` or old `toolInvocations`
        let parts: any[] | undefined = undefined;

        if (Array.isArray(dbData)) {
          // Heuristic: Check if it's the new `parts` structure or the old `toolInvocations` array.
          // The new structure has objects with a `type` property.
          if (dbData.length > 0 && dbData[0].type) {
            parts = dbData; // It's the new format, use as is.
          } else {
            // It's the old format, normalize it to the `parts` structure.
            parts = dbData.map((ti: any) => ({
              type: "tool-invocation",
              toolInvocation: ti,
            }));
          }
        }

        return {
          id: msg.id,
          role: msg.role as "user" | "assistant" | "data",
          content: msg.content,
          parts: parts, // Pass the correctly structured parts
        };
      });
    } catch (error) {
      console.error("Failed to load messages:", error);
      setIsLoaded(true);
      return [];
    }
  }, [chatId, isLoaded]);

  return { loadMessages, isLoaded };
};

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const chatId = params?.id as string;
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { queryParams } = useRouterStuff();

  // State to prevent infinite loops
  const [promptProcessed, setPromptProcessed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Custom hooks following separation of concerns
  const { saveMessage, markAsSaved, savedMessageIds } =
    useMessagePersistence(chatId);
  const { loadMessages, isLoaded } = useMessageLoader(chatId);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    append,
    isLoading,
    setMessages,
  } = useChat({
    id: chatId,
    api: "/api/chat",
    initialMessages: [],
    maxSteps: 5,
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Load existing messages once when component mounts
  useEffect(() => {
    if (!chatId) {
      router.push("/chatbot");
      return;
    }

    if (!isInitialized) {
      const initializeChat = async () => {
        const loadedMessages = await loadMessages();
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
          // Mark all loaded messages as saved to prevent re-saving
          markAsSaved(loadedMessages.map((msg) => msg.id));
        }
        setIsInitialized(true);
      };

      initializeChat();
    }
  }, [chatId, router, isInitialized, loadMessages, setMessages, markAsSaved]);

  // Handle initial prompt from URL params - ONLY ONCE
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && isInitialized && !promptProcessed && messages.length === 0) {
      append({
        role: "user",
        content: prompt,
      });

      queryParams({
        del: ["prompt"],
      });
      setPromptProcessed(true);

      // Clear the prompt from URL to prevent re-triggering
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("prompt");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [
    searchParams,
    append,
    isInitialized,
    promptProcessed,
    messages.length,
    queryParams,
  ]);

  // Save new messages as they are added, handling streaming
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isLoaded || !isInitialized) return;

    messages.forEach((msg, index) => {
      const isLastAssistantMessage =
        msg.role === "assistant" && index === messages.length - 1;
      const isStreaming = isLoading && isLastAssistantMessage;

      if (!savedMessageIds.has(msg.id) && !isStreaming) {
        saveMessage(msg);
      }
    });
  }, [
    messages,
    savedMessageIds,
    saveMessage,
    isLoaded,
    isInitialized,
    isLoading,
  ]);

  // Auto-scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!chatId) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-white no-scrollbar">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4" />
      <div
        ref={chatContainerRef}
        className="no-scrollbar flex-1 pb-16 space-y-2 overflow-y-auto p-4 max-w-2xl w-full mx-auto"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg as ChatMessage} />
          ))}
        </AnimatePresence>
      </div>

      {error && (
        <div className="p-4 text-red-500 border-t bg-red-50 dark:bg-red-900/20">
          <p className="font-semibold">Ocorreu um erro:</p>
          <p>{error.message}</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                handleSubmit(e);
              }
            }}
          >
            <MultimodalInput
              stop={() => {}}
              input={input}
              setInput={(value) =>
                handleInputChange({
                  target: { value },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              isLoading={isLoading}
              messages={messages}
              append={append}
              handleSubmit={handleSubmit}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
