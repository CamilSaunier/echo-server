import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.email({ error: "Invalid email format" }),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ error: "Invalid email format" }),
    password: z.string().min(1, "Password is required"),
  }),
});
