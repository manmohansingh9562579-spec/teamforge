import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "A valid user ID is required")
  .transform((value) => value.toLowerCase());

export const createContactRequestSchema = z.object({
  recipientId: objectIdSchema,
  message: z.string().trim().max(500).optional().default(""),
});

export const updateContactRequestSchema = z.object({
  action: z.enum(["accepted", "rejected", "cancelled"]),
});
