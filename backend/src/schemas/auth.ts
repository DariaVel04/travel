import { z } from 'zod';

export const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long');

export const registerSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(1).max(80),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    email: emailSchema.optional(),
  })
  .refine((value) => value.name !== undefined || value.email !== undefined, {
    message: 'Provide a name or email to update',
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
