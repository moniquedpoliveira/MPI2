import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "@/actions/fiscais";

export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const all = await getUserNotifications(userId);
      return all.filter((n: any) => !n.read);
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });

  const markAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
  };

  return {
    notifications,
    isLoading,
    refetch,
    markAsRead,
  };
}
