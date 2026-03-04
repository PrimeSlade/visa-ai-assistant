import type { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/errors";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      error: error.message,
    });
    return;
  }

  const message =
    error instanceof Error ? error.message : "Unknown error occurred";

  res.status(500).json({
    error: message,
  });
};
