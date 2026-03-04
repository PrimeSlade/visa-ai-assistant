import type { ChatHistoryItem } from "../models/chat.model";

export type ChatHistoryFormat = "reply" | "editor";

export function formatChatHistory(
  history: ChatHistoryItem[],
  format: ChatHistoryFormat
): string {
  return history
    .map((item) => {
      if (format === "editor") {
        const speaker =
          item.role === "consultant" ? "[Consultant]" : "[Client]";
        return `${speaker}: ${item.message}`;
      }

      const speaker = item.role === "consultant" ? "CONSULTANT" : "CLIENT";
      return `(${speaker}) ${item.message}`;
    })
    .join("\n");
}
