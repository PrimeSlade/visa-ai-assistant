"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteMyConversation,
  getChatHistory,
  type DeleteMyConversationResponse,
  type GetChatHistoryResponse,
} from "@/lib/chat.api";

export function useChatHistory() {
  return useQuery({
    queryKey: ["chat-history"],
    queryFn: getChatHistory,
  });
}

export function useDeleteMyConversation() {
  const queryClient = useQueryClient();

  return useMutation<DeleteMyConversationResponse, Error>({
    mutationFn: deleteMyConversation,
    onSuccess: async () => {
      queryClient.setQueryData<GetChatHistoryResponse>(["chat-history"], {
        conversationId: null,
        chatHistory: [],
      });

      await queryClient.invalidateQueries({
        queryKey: ["chat-history"],
      });
    },
  });
}
