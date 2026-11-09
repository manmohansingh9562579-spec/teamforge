import { z } from "zod";
import { CODING_LANGUAGES, getCodingProblem } from "@/lib/codingChallenges";

export const codingExecutionSchema = z.object({
  problemSlug: z.string().refine((slug) => Boolean(getCodingProblem(slug)), "Choose a valid problem"),
  language: z.enum(CODING_LANGUAGES.map((language) => language.id) as [string, ...string[]]),
  sourceCode: z.string().trim().min(1, "Add your solution code").max(30000, "Keep your solution under 30,000 characters"),
  mode: z.enum(["run", "submit"]),
});

export type CodingExecutionInput = z.infer<typeof codingExecutionSchema>;
