import { z } from "zod";

export const identifySchema = z
  .object({
    email: z.email("Invalid email format").nullable().optional(),
    phoneNumber: z
      .string()
      .min(1, "Phone number cannot be empty")
      .nullable()
      .optional(),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "At least one of email or phoneNumber is required",
  });

export type IdentifyInput = z.infer<typeof identifySchema>;