import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must be at least 3 characters")
      .max(30)
      .regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, - or _ only"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72)
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;
