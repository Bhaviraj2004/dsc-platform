import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email required'),
  password: z.string().trim().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CA', 'CLIENT'], { message: 'Role must be CA or CLIENT' }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;