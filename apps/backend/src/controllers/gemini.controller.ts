import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../lib/apiResponse";
import { HttpError } from "../lib/errors";
import { parseRequiredString } from "../lib/requestParsers";
import type {
  GeminiTestInput,
  GeminiTestRequestBody,
} from "../models/gemini.model";
import { runGeminiTest } from "../services/gemini.service";

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

export async function testGemini(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input: GeminiTestInput = parseGeminiTestInput(
      req.body as GeminiTestRequestBody
    );
    const result = await runGeminiTest(input);
    sendSuccess(res, {
      message: "Gemini test completed successfully.",
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
