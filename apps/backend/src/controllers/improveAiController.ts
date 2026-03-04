import type { Request, Response } from "express";
import { HttpError } from "../lib/errors";
import type { ImproveAiInput, ImproveAiRequestBody } from "../models/improveAi";
import { asyncHandler } from "../middleware/asyncHandler";
import { parseChatHistory, parseRequiredString } from "../lib/requestParsers";
import { improveAi } from "../services/improveAiService";

function parseImproveAiInput(body: ImproveAiRequestBody): ImproveAiInput {
  const { clientSequence, chatHistory, consultantReply } = body;

  return {
    clientSequence: parseRequiredString(
      clientSequence,
      "Request body must include a non-empty string `clientSequence`."
    ),
    chatHistory: parseChatHistory(chatHistory),
    consultantReply: parseRequiredString(
      consultantReply,
      "Request body must include a non-empty string `consultantReply`."
    ),
  };
}

export const improveAiHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let input: ImproveAiInput;

    try {
      input = parseImproveAiInput(req.body as ImproveAiRequestBody);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid request body.";
      throw new HttpError(400, message);
    }

    const result = await improveAi(input);
    res.json(result);
  }
);
