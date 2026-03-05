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

export type SendChatReplyRequest = {
  message: string;
};

export type SendChatReplyResponse = {
  conversationId: string;
  reply: string;
  clientMessage: ChatHistoryMessage;
  consultantMessage: ChatHistoryMessage;
  status: {
    clientMessage: "created";
    aiReply: "generated";
    consultantMessage: "created";
  };
};

export type DeleteMyConversationResponse = {
  deletedConversations: number;
};

type ApiSuccessResponse<T> = {
  status: "success";
  code: number;
  message: string;
  data: T;
};

export const getChatHistory = async (): Promise<GetChatHistoryResponse> => {
  try {
    const { data } = await apiClient.get<
      ApiSuccessResponse<GetChatHistoryResponse>
    >("/chat-history");

    return data.data;
  } catch (error: any) {
    throw new Error(error.message ?? "Failed to fetch chat history.");
  }
};

export const sendChatReply = async (
  input: SendChatReplyRequest
): Promise<SendChatReplyResponse> => {
  try {
    if (
      !input ||
      typeof input !== "object" ||
      typeof input.message !== "string" ||
      input.message.trim().length === 0
    ) {
      throw new Error(
        "Invalid request payload. Expected an object like { message: string }."
      );
    }

    const { data } = await apiClient.post<
      ApiSuccessResponse<SendChatReplyResponse>
    >("/chat-reply", input);

    return data.data;
  } catch (error: any) {
    throw new Error(error.message ?? "Failed to send chat reply request.");
  }
};

export const deleteMyConversation =
  async (): Promise<DeleteMyConversationResponse> => {
    try {
      const { data } = await apiClient.delete<
        ApiSuccessResponse<DeleteMyConversationResponse>
      >("/me/conversation");

      return data.data;
    } catch (error: any) {
      throw new Error(error.message ?? "Failed to delete conversation.");
    }
  };
