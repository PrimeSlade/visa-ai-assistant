import { formatChatHistory } from "../lib/chatHistory";
import { generateGeminiJsonReply } from "../lib/gemini";
import { getSystemPromptContent } from "../lib/systemPrompts";
import type {
  GenerateReplyInput,
  GenerateReplyResult,
} from "../models/generateReply";

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
