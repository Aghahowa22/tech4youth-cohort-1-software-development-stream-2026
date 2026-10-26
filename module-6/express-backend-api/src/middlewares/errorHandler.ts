import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.ts";
import { logger } from "../lib/logger.ts";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  logger.error({ err }, "unhandled err");
  res.status(500).json({ success: false, message: "internal server error" });
}
