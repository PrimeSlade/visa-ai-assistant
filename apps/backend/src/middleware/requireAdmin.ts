import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors";

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user?.id) {
    next(new HttpError(401, "Unauthorized."));
    return;
  }

  if (req.user.role !== "admin") {
    next(new HttpError(403, "Forbidden."));
    return;
  }

  next();
}
