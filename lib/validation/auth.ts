import { z } from "zod";

const honeypot = z.string().max(0, "Bot detected.");

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254),
  password: z.string().min(1, "Please enter your password."),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Please enter your full name.")
      .max(100),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(254),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number.")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    college: z.string().trim().max(200).optional().or(z.literal("")),
    degree: z.string().trim().max(100).optional().or(z.literal("")),
    graduationYear: z
      .string()
      .trim()
      .regex(/^(202\d|203\d)$/, "Please enter a valid graduation year.")
      .optional()
      .or(z.literal("")),
    referralCode: z.string().trim().max(20).optional().or(z.literal("")),
    consent: z
      .boolean()
      .refine((v) => v, "Please accept the Terms and Privacy Policy to create an account."),
    website: honeypot,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
