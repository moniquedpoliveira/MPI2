"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useSession() {
  const { data: session, status } = useNextAuthSession();

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
  };
} 