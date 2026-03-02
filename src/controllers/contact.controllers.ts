import { Request, Response, NextFunction } from "express";
import { IdentifyInput } from "../validators/contact.validators";
import { sendSuccess } from "../utils/apiResponse";

export const identifyContact = async (
  req: Request<{}, {}, IdentifyInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, phoneNumber } = req.body;

    // service call here
    sendSuccess({
      res,
      message: "Contact identified",
      data: { received: { email, phoneNumber } },
    });
  } catch (err) {
    next(err);
  }
};