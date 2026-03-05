import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../lib/apiResponse";
import { HttpError } from "../lib/errors";
import { parseChatHistory, parseRequiredString } from "../lib/requestParsers";
import type {
  AdminPromptResult,
  ImproveAiInput,
  ImproveAiManuallyInput,
  ImproveAiManuallyRequestBody,
  ImproveAiRequestBody,
  UpdateConsultantPromptInput,
  UpdateConsultantPromptRequestBody,
} from "../models/prompt.model";
import {
  getAdminPromptByName,
  improveAi,
  improveAiManually,
  updateConsultantPrompt,
} from "../services/prompt.service";

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

function parseImproveAiManuallyInput(
  body: ImproveAiManuallyRequestBody
): ImproveAiManuallyInput {
  const { instructions } = body;

  return {
    instructions: parseRequiredString(
      instructions,
      "Request body must include a non-empty string `instructions`."
    ),
  };
}

function parseUpdateConsultantPromptInput(
  body: UpdateConsultantPromptRequestBody
): UpdateConsultantPromptInput {
  const { prompt } = body;

  return {
    prompt: parseRequiredString(
      prompt,
      "Request body must include a non-empty string `prompt`."
    ),
  };
}

export async function improveAiHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input: ImproveAiInput = parseImproveAiInput(
      req.body as ImproveAiRequestBody
    );
    const result = await improveAi(input);
    sendSuccess(res, {
      message: "AI prompt improved successfully.",
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

export async function improveAiManuallyHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input: ImproveAiManuallyInput = parseImproveAiManuallyInput(
      req.body as ImproveAiManuallyRequestBody
    );
    const result = await improveAiManually(input);
    sendSuccess(res, {
      message: "AI prompt updated successfully.",
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

export async function getAdminPromptByNameHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result: AdminPromptResult = await getAdminPromptByName();
    sendSuccess(res, {
      message: "System prompt retrieved successfully.",
      data: result,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve system prompt.";
    next(new HttpError(400, message));
  }
}

export async function updateConsultantPromptHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input: UpdateConsultantPromptInput = parseUpdateConsultantPromptInput(
      req.body as UpdateConsultantPromptRequestBody
    );
    const result: AdminPromptResult = await updateConsultantPrompt(input);
    sendSuccess(res, {
      message: "Consultant prompt updated successfully.",
      data: result,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    const message =
      error instanceof Error ? error.message : "Failed to update consultant prompt.";
    next(new HttpError(400, message));
  }
}
