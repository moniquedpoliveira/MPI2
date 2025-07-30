import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Chat {
  id: string
  title: string | null
  createdAt: string
  updatedAt: string
  messages: Array<{
    id: string
    role: string
    content: string | null
    createdAt: string
  }>
}

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async (): Promise<Chat[]> => {
      const response = await fetch('/api/chats')
      if (!response.ok) {
        throw new Error('Failed to fetch chats')
      }
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useGenerateChatTitle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`/api/chats/${chatId}/generate-title`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to generate chat title')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch chats
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
} 