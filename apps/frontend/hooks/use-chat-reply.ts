"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendChatReply,
  type ChatHistoryMessage,
  type GetChatHistoryResponse,
  type SendChatReplyRequest,
  type SendChatReplyResponse,
} from "@/lib/chat.api";

type OptimisticContext = {
  previousChatHistory?: GetChatHistoryResponse;
  optimisticMessageId: string;
};

export function useChatReply() {
  const queryClient = useQueryClient();

  return useMutation<
    SendChatReplyResponse,
    Error,
    SendChatReplyRequest,
    OptimisticContext
  >({
    mutationFn: (input: SendChatReplyRequest) => sendChatReply(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: ["chat-history"],
      });

      const previousChatHistory = queryClient.getQueryData<GetChatHistoryResponse>([
        "chat-history",
      ]);
      const optimisticMessageId = `temp-client-${Date.now()}`;

      queryClient.setQueryData<GetChatHistoryResponse>(
        ["chat-history"],
        (current) => {
          const base = current ?? {
            conversationId: null,
            chatHistory: [],
          };

          const optimisticMessage: ChatHistoryMessage = {
            id: optimisticMessageId,
            role: "client",
            message: input.message,
            createdAt: new Date().toISOString(),
          };

          return {
            ...base,
            chatHistory: [...base.chatHistory, optimisticMessage],
          };
        }
      );

      return {
        previousChatHistory,
        optimisticMessageId,
      };
    },
    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData<GetChatHistoryResponse>(
        ["chat-history"],
        (current) => {
          const base = current ?? {
            conversationId: data.conversationId,
            chatHistory: [],
          };
          const withoutOptimistic = base.chatHistory.filter(
            (message) => message.id !== context?.optimisticMessageId
          );

          return {
            conversationId: data.conversationId,
            chatHistory: [
              ...withoutOptimistic,
              data.clientMessage,
              data.consultantMessage,
            ],
          };
        }
      );
    },
    onError: async (_error, _variables, context) => {
      if (context?.previousChatHistory) {
        queryClient.setQueryData(["chat-history"], context.previousChatHistory);
      }

      await queryClient.invalidateQueries({
        queryKey: ["chat-history"],
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["chat-history"],
      });
    },
  });
}
