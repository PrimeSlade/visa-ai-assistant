"use client";

import { useQuery } from "@tanstack/react-query";
import { getChatHistory } from "@/lib/chat.api";

export function useChatHistory() {
  return useQuery({
    queryKey: ["chat-history"],
    queryFn: getChatHistory,
  });
}
