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
    onMutate: async (input: SendChatReplyRequest) => {
      await queryClient.cancelQueries({
        queryKey: ["chat-history"],
      });

      const previousChatHistory =
        queryClient.getQueryData<GetChatHistoryResponse>(["chat-history"]);
      const optimisticMessageId = `temp-client-${Date.now()}`;

      queryClient.setQueryData<GetChatHistoryResponse>(
        ["chat-history"],
        (
          current: GetChatHistoryResponse | undefined
        ): GetChatHistoryResponse => {
          const base: GetChatHistoryResponse = current ?? {
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
    onSuccess: (
      data: SendChatReplyResponse,
      _variables: SendChatReplyRequest,
      onMutateResult: OptimisticContext | undefined
    ) => {
      queryClient.setQueryData<GetChatHistoryResponse>(
        ["chat-history"],
        (
          current: GetChatHistoryResponse | undefined
        ): GetChatHistoryResponse => {
          const base: GetChatHistoryResponse = current ?? {
            conversationId: data.conversationId,
            chatHistory: [],
          };
          const withoutOptimistic = base.chatHistory.filter(
            (message) => message.id !== onMutateResult?.optimisticMessageId
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
    onError: async (
      _error: Error,
      _variables: SendChatReplyRequest,
      onMutateResult: OptimisticContext | undefined
    ) => {
      if (onMutateResult?.previousChatHistory) {
        queryClient.setQueryData<GetChatHistoryResponse>(
          ["chat-history"],
          onMutateResult.previousChatHistory
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["chat-history"],
      });
    },
    onSettled: async (
      _data: SendChatReplyResponse | undefined,
      _error: Error | null,
      _variables: SendChatReplyRequest,
      _onMutateResult: OptimisticContext | undefined
    ) => {
      await queryClient.invalidateQueries({
        queryKey: ["chat-history"],
      });
    },
  });
}
