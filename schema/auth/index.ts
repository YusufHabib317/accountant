import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Username or email is required' })
    .refine(
      (value) => (value.includes('@')
        ? z.string().email().safeParse(value).success
        : true),
      { message: 'Please provide a valid email address' },
    ),

  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

// const passwordSchema = z
//   .string()
//   .min(8, 'Password must be at least 8 characters long')
//   .regex(/[a-z]/, 'Password must include at least one lowercase letter')
//   .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
//   .regex(/[0-9]/, 'Password must include at least one number')
//   .regex(/[\W_]/, 'Password must include at least one special character');

export const registerSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    // password: z.string(),
    confirmPassword: z.string(),
    name: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export const sendResetEmailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export const setNewPasswordSchema = z
  .object({
    newPassword: z.string(),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });
