import type { Request, Response } from "express";
import { HttpError } from "../lib/errors";
import { asyncHandler } from "../middleware/asyncHandler";
import type {
  ImproveAiManuallyInput,
  ImproveAiManuallyRequestBody,
} from "../models/improveAiManually";
import { parseRequiredString } from "../lib/requestParsers";
import { improveAiManually } from "../services/improveAiManuallyService";

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

export const improveAiManuallyHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let input: ImproveAiManuallyInput;

    try {
      input = parseImproveAiManuallyInput(
        req.body as ImproveAiManuallyRequestBody
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid request body.";
      throw new HttpError(400, message);
    }

    const result = await improveAiManually(input);
    res.json(result);
  }
);
