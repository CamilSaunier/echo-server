import { z } from "zod";

// Regex pour un mot de passe fort : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
  body: z.object({
    email: z.email({ error: "Invalid email format" }),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().regex(passwordRegex, {
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ error: "Invalid email format" }),
    password: z.string().min(1, "Password is required"), // Pour le login, on vérifie juste qu'il n'est pas vide
  }),
});
