import { z } from "zod";

export const tipoUbicacionEnum = z.enum(["AULA", "OFICINA", "EDIFICIO", "VIRTUAL", "OTRO"]);

export const lugarCreateSchema = z.object({
  descripcion: z.string().trim().min(3, "La descripción debe tener al menos 3 caracteres").max(120).optional().or(z.literal("")),
  tipoUbicacion: tipoUbicacionEnum.optional(),
  edificio: z.string().trim().max(80).optional().or(z.literal("")),
  salonOficinaAula: z.string().trim().max(80).optional().or(z.literal("")),
  municipioCiudad: z.string().trim().max(80).optional().or(z.literal("")),
  coloniaBarrio: z.string().trim().max(80).optional().or(z.literal("")),
});

export const lugarUpdateSchema = lugarCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});

export const lugarToggleSchema = z.object({
  id: z.coerce.number().int().positive(),
});
