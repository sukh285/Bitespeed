import { Request, Response, NextFunction } from "express";
import { IdentifyInput } from "../validators/contact.validators";
import { sendSuccess } from "../utils/apiResponse";
import { identifyContact } from "../services/contact.service";

export const handleIdentify = async (
  req: Request<{}, {}, IdentifyInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, phoneNumber } = req.body;

    const result = await identifyContact(email, phoneNumber);

    sendSuccess({
      res,
      message: "Contact identified successfully",
      data: { contact: result },
    });
  } catch (err) {
    next(err);
  }
};