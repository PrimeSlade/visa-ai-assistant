import prisma from "../lib/prisma";

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

export type ChatHistoryMessage = {
  id: string;
  role: "client" | "consultant";
  message: string;
  createdAt: Date;
};

export type GetChatHistoryResult = {
  conversationId: string | null;
  chatHistory: ChatHistoryMessage[];
};

type UserWithConversations = {
  conversations?: Array<{
    id: string;
    messages?: Array<{
      id: string;
      senderType: "client" | "consultant";
      content: string;
      createdAt: Date;
    }>;
  }>;
};

export async function findUserChatHistory(
  userId: string
): Promise<GetChatHistoryResult | null> {
  const user = (await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      conversations: {
        orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
        take: 1,
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  } as never)) as UserWithConversations | null;

  if (!user) {
    return null;
  }

  const conversation = user.conversations?.[0];

  return {
    conversationId: conversation?.id ?? null,
    chatHistory:
      conversation?.messages?.map((message) => ({
        id: message.id,
        role: message.senderType,
        message: message.content,
        createdAt: message.createdAt,
      })) ?? [],
  };
}
