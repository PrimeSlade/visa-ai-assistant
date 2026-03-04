import type { Request, Response } from "express";
import { HttpError } from "../lib/errors";
import { asyncHandler } from "../middleware/asyncHandler";
import type {
  GenerateReplyInput,
  GenerateReplyRequestBody,
} from "../models/generateReply";
import { parseChatHistory, parseRequiredString } from "../lib/requestParsers";
import { generateReply } from "../services/generateReplyService";

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

export const generateReplyHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let input: GenerateReplyInput;

    try {
      input = parseGenerateReplyInput(req.body as GenerateReplyRequestBody);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid request body.";
      throw new HttpError(400, message);
    }

    const result = await generateReply(input);
    res.json(result);
  }
);
