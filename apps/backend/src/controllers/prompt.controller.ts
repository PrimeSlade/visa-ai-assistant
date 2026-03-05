import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../lib/apiResponse";
import { HttpError } from "../lib/errors";
import { parseChatHistory, parseRequiredString } from "../lib/requestParsers";
import type {
  AdminPromptResult,
  ImproveAiInput,
  ImproveAiBudgetInput,
  ImproveAiBudgetRequestBody,
  ImproveAiManuallyInput,
  ImproveAiManuallyRequestBody,
  ImproveAiRequestBody,
  UpdateConsultantPromptInput,
  UpdateConsultantPromptRequestBody,
} from "../models/prompt.model";
import {
  getAdminPromptByName,
  improveAi,
  improveAiBudget,
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

function parseImproveAiBudgetInput(
  body: ImproveAiBudgetRequestBody
): ImproveAiBudgetInput {
  const { conversations, similarityThreshold } = body;

  if (!Array.isArray(conversations)) {
    throw new Error("Request body must include `conversations` as an array.");
  }

  let parsedThreshold = 0.7;
  if (similarityThreshold !== undefined) {
    if (
      typeof similarityThreshold !== "number" ||
      Number.isNaN(similarityThreshold)
    ) {
      throw new Error("If provided, `similarityThreshold` must be a number.");
    }

    if (similarityThreshold < 0 || similarityThreshold > 1) {
      throw new Error("`similarityThreshold` must be between 0 and 1.");
    }

    parsedThreshold = similarityThreshold;
  }

  return {
    conversations: conversations as ImproveAiBudgetInput["conversations"],
    similarityThreshold: parsedThreshold,
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

export async function improveAiBudgetHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input: ImproveAiBudgetInput = parseImproveAiBudgetInput(
      req.body as ImproveAiBudgetRequestBody
    );
    const result = await improveAiBudget(input);
    sendSuccess(res, {
      message: "Budget improvement analysis completed successfully.",
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
      error instanceof Error
        ? error.message
        : "Failed to update consultant prompt.";
    next(new HttpError(400, message));
  }
}
