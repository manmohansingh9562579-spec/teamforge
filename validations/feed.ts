import { z } from "zod";
import { FEED_POST_TYPES } from "@/models/FeedPost";

const optionalHttpsUrl = z
  .string()
  .trim()
  .max(500)
  .default("")
  .refine((value) => !value || /^https:\/\//i.test(value), "Use a secure https:// link");

export const createFeedPostSchema = z.object({
  type: z.enum(FEED_POST_TYPES),
  content: z.string().trim().min(1, "Write something before sharing").max(2000),
  projectName: z.string().trim().max(100).default(""),
  githubUrl: optionalHttpsUrl,
  demoUrl: optionalHttpsUrl,
  skills: z.array(z.string().trim().min(1).max(30)).max(5).default([]),
}).refine((value) => value.type !== "build" || value.projectName.length > 0, {
  path: ["projectName"],
  message: "Add a project name to showcase a build",
});

export const createFeedCommentSchema = z.object({
  content: z.string().trim().min(1).max(800),
});
