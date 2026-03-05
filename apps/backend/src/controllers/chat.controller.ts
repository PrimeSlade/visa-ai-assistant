import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../lib/apiResponse";
import { HttpError } from "../lib/errors";
import { parseChatHistory, parseRequiredString } from "../lib/requestParsers";
import type {
  GenerateReplyInput,
  GenerateReplyRequestBody,
} from "../models/chat.model";
import {
  generateReply,
  generateReplyFromMessage,
  getChatHistory,
} from "../services/chat.service";

function parseGenerateReplyInput(
  body: GenerateReplyRequestBody
): GenerateReplyInput {
  const { clientSequence, chatHistory } = body;

  return {
    clientSequence: parseRequiredString(
      clientSequence,
      "Request body must include a non-empty string `clientSequence`."
    ),
    chatHistory: parseChatHistory(chatHistory),
  };
}

export async function generateReplyHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input: GenerateReplyInput = parseGenerateReplyInput(
      req.body as GenerateReplyRequestBody
    );
    const result = await generateReply(input);
    sendSuccess(res, {
      message: "Reply generated successfully.",
      data: result,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    const message =
      error instanceof Error ? error.message : "Invalid request body.";
    next(new HttpError(400, message));
  }
}

export async function getChatHistoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError(401, "Unauthorized.");
    }

    const result = await getChatHistory(userId);
    sendSuccess(res, {
      message: "Chat history fetched successfully.",
      data: result,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    const message =
      error instanceof Error ? error.message : "Failed to load chat history.";
    next(new HttpError(500, message));
  }
}

export async function generateReplyFromMessageHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError(401, "Unauthorized.");
    }

    const parsed = req.body;

    const result = await generateReplyFromMessage({
      userId,
      message: parsed.message,
    });

    sendSuccess(res, {
      message: "Reply generated successfully.",
      data: result,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    const message =
      error instanceof Error ? error.message : "Invalid request body.";
    next(new HttpError(400, message));
  }
}
