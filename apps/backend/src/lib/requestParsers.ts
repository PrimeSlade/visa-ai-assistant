import type {
  ChatHistoryItem,
  ChatHistoryItemBody,
} from "../models/generateReply";

export function parseRequiredString(
  value: unknown,
  errorMessage: string
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(errorMessage);
  }

  return value.trim();
}

export function parseChatHistoryItem(
  item: ChatHistoryItemBody,
  index: number
): ChatHistoryItem {
  if (typeof item !== "object" || item === null) {
    throw new Error(`chatHistory[${index}] must be an object.`);
  }

  const { role, message } = item;

  if (role !== "client" && role !== "consultant") {
    throw new Error(
      `chatHistory[${index}].role must be either "client" or "consultant".`
    );
  }

  return {
    role,
    message: parseRequiredString(
      message,
      `chatHistory[${index}].message must be a non-empty string.`
    ),
  };
}

export function parseChatHistory(value: unknown): ChatHistoryItem[] {
  if (!Array.isArray(value)) {
    throw new Error("Request body must include `chatHistory` as an array.");
  }

  return value.map((item, index) =>
    parseChatHistoryItem(item as ChatHistoryItemBody, index)
  );
}
