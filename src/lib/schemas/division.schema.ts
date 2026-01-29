import { z } from "zod";

export const divisionCreateSchema = z.object({
  siglas: z
    .string()
    .trim()
    .min(2, "Las siglas deben tener al menos 2 caracteres")
    .max(20, "Máximo 20 caracteres"),

  descripcion: z
    .string()
    .trim()
    .max(240, "Máximo 240 caracteres")
    .optional()
    .or(z.literal("")),
});

export const divisionUpdateSchema = divisionCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});
