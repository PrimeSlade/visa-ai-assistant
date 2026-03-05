import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { HttpError } from "../lib/errors";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      next(new HttpError(401, "Unauthorized."));
      return;
    }

    req.user = session.user;
    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication failed.";
    next(new HttpError(401, message));
  }
}
