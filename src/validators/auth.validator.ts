import { z } from "zod";

// Regex pour un mot de passe fort : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Format d'email invalide"),
    username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
    password: z.string().regex(passwordRegex, {
      message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
    }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(1, "Le mot de passe est requis"),
  }),
});
