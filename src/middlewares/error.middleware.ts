import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // known, intentional error
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }

  // unknown, unexpected crash
  console.error("Unexpected error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    data: null,
  });
};
