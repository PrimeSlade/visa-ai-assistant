import type { Request, Response } from "express";
import { HttpError } from "../lib/errors";
import { asyncHandler } from "../middleware/asyncHandler";
import type {
  GeminiTestInput,
  GeminiTestRequestBody,
} from "../models/geminiTest";
import { parseRequiredString } from "../lib/requestParsers";
import { runGeminiTest } from "../services/geminiTestService";

function parseGeminiTestInput(body: GeminiTestRequestBody): GeminiTestInput {
  const { message, systemPrompt } = body;

  if (systemPrompt !== undefined && typeof systemPrompt !== "string") {
    throw new Error("If provided, `systemPrompt` must be a string.");
  }

  return {
    message: parseRequiredString(
      message,
      "Request body must include a non-empty string `message`."
    ),
    systemPrompt,
  };
}

export const testGemini = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let input: GeminiTestInput;

    try {
      input = parseGeminiTestInput(req.body as GeminiTestRequestBody);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid request body.";
      throw new HttpError(400, message);
    }

    const result = await runGeminiTest(input);
    res.json(result);
  }
);
