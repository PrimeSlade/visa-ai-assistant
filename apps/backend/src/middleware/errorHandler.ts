import type { ErrorRequestHandler } from "express";
import { sendError } from "../lib/apiResponse";
import { HttpError } from "../lib/errors";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    sendError(res, {
      code: error.statusCode,
      message: error.message,
    });
    return;
  }

  const message =
    error instanceof Error ? error.message : "Unknown error occurred";

  sendError(res, {
    code: 500,
    message,
  });
};
