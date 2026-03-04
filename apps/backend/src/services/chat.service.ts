import { HttpError } from "../lib/errors";
import { formatChatHistory } from "../lib/chatHistory";
import { generateGeminiJsonReply } from "../lib/gemini";
import { getSystemPromptContent } from "../lib/systemPrompts";
import {
  findUserChatHistory,
  type GenerateReplyInput,
  type GenerateReplyResult,
  type GetChatHistoryResult,
} from "../models/chat.model";

export async function generateReply(
  input: GenerateReplyInput
): Promise<GenerateReplyResult> {
  const systemPrompt = await getSystemPromptContent();
  const promptSections = [
    "Generate the next consultant DM reply based on the client messages and prior chat history.",
    "",
    "CLIENT:",
    input.clientSequence.trim(),
  ];

  if (input.chatHistory.length > 0) {
    promptSections.push(
      "",
      "CHAT HISTORY:",
      formatChatHistory(input.chatHistory, "reply")
    );
  }

  const aiReply = await generateGeminiJsonReply(
    systemPrompt,
    promptSections.join("\n")
  );

  return {
    aiReply,
  };
}

export async function getChatHistory(
  userId: string
): Promise<GetChatHistoryResult> {
  const chatHistory = await findUserChatHistory(userId);

  if (!chatHistory) {
    throw new HttpError(404, "User not found.");
  }

  return chatHistory;
}
