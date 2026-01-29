import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.string().trim().email('Email inválido').toLowerCase(),
  password: z
    .string().min(1, 'Contraseña requerida')
});

export type LoginInput = z.infer<typeof loginSchema>;
