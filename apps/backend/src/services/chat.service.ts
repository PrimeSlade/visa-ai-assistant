import { HttpError } from "../lib/errors";
import { formatChatHistory } from "../lib/chatHistory";
import { generateGeminiJsonReply } from "../lib/gemini";
import prisma from "../lib/prisma";
import { getSystemPromptContent } from "../lib/systemPrompts";
import {
  createConversation,
  createConversationMessage,
  findUserChatHistory,
  findLatestConversationId,
  setConversationLastMessageAt,
  type GenerateReplyFromMessageInput,
  type GenerateReplyFromMessageResult,
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

export async function generateReplyFromMessage(
  input: GenerateReplyFromMessageInput
): Promise<GenerateReplyFromMessageResult> {
  const chatHistory = await getChatHistory(input.userId);

  const replyResult = await generateReply({
    clientSequence: input.message,
    chatHistory: chatHistory.chatHistory.map((item) => ({
      role: item.role,
      message: item.message,
    })),
  });

  const persisted = await prisma.$transaction(async (tx) => {
    //conver id
    const latestConversationId = await findLatestConversationId(
      tx,
      input.userId
    );

    //not create new
    const conversationId =
      latestConversationId ?? (await createConversation(tx, input.userId));

    const clientMessage = await createConversationMessage(tx, {
      conversationId,
      senderType: "client",
      content: input.message,
    });

    const consultantMessage = await createConversationMessage(tx, {
      conversationId,
      senderType: "consultant",
      content: replyResult.aiReply,
    });

    await setConversationLastMessageAt(
      tx,
      conversationId,
      consultantMessage.createdAt
    );

    return {
      conversationId,
      clientMessage,
      consultantMessage,
    };
  });

  return {
    conversationId: persisted.conversationId,
    reply: replyResult.aiReply,
    clientMessage: persisted.clientMessage,
    consultantMessage: persisted.consultantMessage,
    status: {
      clientMessage: "created",
      aiReply: "generated",
      consultantMessage: "created",
    },
  };
}
