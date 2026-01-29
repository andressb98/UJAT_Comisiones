import { z } from "zod";

export const tipoComisionCreateSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "Máximo 120 caracteres"),

  descripcion: z
    .string()
    .trim()
    .max(240, "Máximo 240 caracteres")
    .optional()
    .or(z.literal("")),
});

export const tipoComisionUpdateSchema = tipoComisionCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});

export const tipoComisionToggleSchema = z.object({
  id: z.coerce.number().int().positive(),
});
