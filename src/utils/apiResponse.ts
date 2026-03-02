import { Response } from "express";

interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
}

export const sendSuccess = <T>({
  res,
  statusCode = 200,
  message = "success",
  data,
}: ApiResponseOptions<T>): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
};