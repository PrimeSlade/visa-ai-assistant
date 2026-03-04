import type { Response } from "express";

type SuccessResponseOptions<T> = {
  code?: number;
  message: string;
  data: T;
};

type ErrorResponseOptions = {
  code: number;
  message: string;
};

export function sendSuccess<T>(
  res: Response,
  { code = 200, message, data }: SuccessResponseOptions<T>
): void {
  res.status(code).json({
    status: "success",
    code,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  { code, message }: ErrorResponseOptions
): void {
  res.status(code).json({
    status: "error",
    code,
    message,
  });
}
