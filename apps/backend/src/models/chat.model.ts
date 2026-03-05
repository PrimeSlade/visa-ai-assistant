import prisma from "../lib/prisma";
import type { Prisma } from "../generated/prisma/client";

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

export type GenerateReplyFromMessageInput = {
  userId: string;
  message: string;
};

export type GenerateReplyFromMessageResult = {
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

export type ChatModelTx = Prisma.TransactionClient;

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

export async function findLatestConversationId(
  tx: ChatModelTx,
  userId: string
): Promise<string | null> {
  const conversation = await tx.conversation.findFirst({
    where: {
      userId,
    },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
    },
  });

  return conversation?.id ?? null;
}

export async function createConversation(
  tx: ChatModelTx,
  userId: string
): Promise<string> {
  const conversation = await tx.conversation.create({
    data: {
      userId,
    },
    select: {
      id: true,
    },
  });

  return conversation.id;
}

export async function createConversationMessage(
  tx: ChatModelTx,
  input: {
    conversationId: string;
    senderType: "client" | "consultant";
    content: string;
  }
): Promise<ChatHistoryMessage> {
  const message = await tx.message.create({
    data: {
      conversationId: input.conversationId,
      senderType: input.senderType,
      content: input.content,
    },
    select: {
      id: true,
      senderType: true,
      content: true,
      createdAt: true,
    },
  });

  return {
    id: message.id,
    role: message.senderType,
    message: message.content,
    createdAt: message.createdAt,
  };
}

export async function setConversationLastMessageAt(
  tx: ChatModelTx,
  conversationId: string,
  lastMessageAt: Date
): Promise<void> {
  await tx.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      lastMessageAt,
    },
  });
}
