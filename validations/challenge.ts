import { z } from "zod";

const httpsUrl = z
  .string()
  .trim()
  .url("Enter a valid link")
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Use a secure https:// link");

export const challengeSubmissionSchema = z
  .object({
    challengeKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    projectName: z.string().trim().min(2, "Add a project name").max(80),
    summary: z.string().trim().min(10, "Add a short project description").max(500),
    repositoryUrl: z.union([httpsUrl, z.literal("")]).optional().default(""),
    demoUrl: z.union([httpsUrl, z.literal("")]).optional().default(""),
  })
  .superRefine((data, context) => {
    if (!data.repositoryUrl && !data.demoUrl) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add a GitHub repository or a live demo link",
        path: ["repositoryUrl"],
      });
    }
  });

export type ChallengeSubmissionInput = z.infer<typeof challengeSubmissionSchema>;
