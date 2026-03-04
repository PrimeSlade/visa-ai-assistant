import { apiClient } from "./api-client";

export type ChatHistoryMessage = {
  id: string;
  role: "client" | "consultant";
  message: string;
  createdAt: string;
};

export type GetChatHistoryResponse = {
  conversationId: string | null;
  chatHistory: ChatHistoryMessage[];
};

type ApiSuccessResponse<T> = {
  status: "success";
  code: number;
  message: string;
  data: T;
};

export const getChatHistory = async (): Promise<GetChatHistoryResponse> => {
  try {
    const { data } = await apiClient.get<ApiSuccessResponse<GetChatHistoryResponse>>(
      "/chat-history"
    );

    return data.data;
  } catch (error: any) {
    throw new Error(error.message ?? "Failed to fetch chat history.");
  }
};
