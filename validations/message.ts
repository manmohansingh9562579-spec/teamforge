import { z } from "zod";

export const createMessageSchema = z.object({
  content: z
    .string()
    .transform((content) => content.replace(/\r\n?/g, "\n"))
    .pipe(z.string().trim().min(1, "Message cannot be empty").max(4000, "Message is too long")),
});
