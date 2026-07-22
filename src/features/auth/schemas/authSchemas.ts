import { z } from "zod";

/**
 * Validation for every auth boundary.
 *
 * Server Actions are public HTTP endpoints — whatever the form component does
 * is a convenience, not a control. These schemas run server-side on every
 * submission, and the client reuses them so the two can't drift.
 */

/**
 * 10 characters is above the usual 8 because this is the only knob we control
 * without a password-strength library. Supabase's leaked-password check
 * (HIBP) is the other half and is enabled in the dashboard.
 */
const password = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(72, "Passwords are limited to 72 characters.");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."))
  .refine((value) => value.length <= 254, "That email address is too long.");

export const loginSchema = z.object({
  email,
  // Deliberately lax on sign-in: length rules belong at registration. Applying
  // them here would tell an attacker which stored passwords are short.
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(80, "That name is too long."),
  email,
  password,
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
