import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .transform((val) => val.trim()),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(12, "Password must be at most 12 characters")
    .transform((val) => val.trim()),
});

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .transform((val) => val.trim()),
  email: z
    .string()
    .email("Invalid email")
    .transform((val) => val.trim()),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(12, "Password must be at most 12 characters")
    .transform((val) => val.trim()),
});

export { loginSchema, registerSchema };
