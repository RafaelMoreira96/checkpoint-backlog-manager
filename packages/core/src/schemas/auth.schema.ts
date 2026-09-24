import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password_hash: z.string().min(4, 'Senha deve ter pelo menos 4 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerPlayerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password_hash: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export type RegisterPlayerFormData = z.infer<typeof registerPlayerSchema>;
