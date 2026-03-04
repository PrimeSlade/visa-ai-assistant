export type ChatHistoryItemBody = {
  role?: unknown;
  message?: unknown;
};

export type GenerateReplyRequestBody = {
  clientSequence?: unknown;
  chatHistory?: unknown;
};

export type ChatHistoryItem = {
  role: "client" | "consultant";
  message: string;
};

export type GenerateReplyInput = {
  clientSequence: string;
  chatHistory: ChatHistoryItem[];
};

export type GenerateReplyResult = {
  aiReply: string;
};
