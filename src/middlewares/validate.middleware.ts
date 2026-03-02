import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formatted = result.error.flatten();
      res.status(400).json({
        success: false,
        message: "Validation failed",
        data: {
          ...formatted.fieldErrors,
          ...(formatted.formErrors.length > 0 && {
            _errors: formatted.formErrors,
          }),
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
