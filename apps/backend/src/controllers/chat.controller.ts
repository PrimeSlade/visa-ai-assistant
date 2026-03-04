import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { sendSuccess } from "../lib/apiResponse";
import { auth } from "../lib/auth";
import { HttpError } from "../lib/errors";
import { parseChatHistory, parseRequiredString } from "../lib/requestParsers";
import type {
  GenerateReplyInput,
  GenerateReplyRequestBody,
} from "../models/chat.model";
import { generateReply, getChatHistory } from "../services/chat.service";

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
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      throw new HttpError(401, "Unauthorized.");
    }

    const result = await getChatHistory(session.user.id);
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
