import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";

export const healthCheck = (req: Request, res: Response): void => {
  sendSuccess({
    res,
    message: "Server is up and running",
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
};