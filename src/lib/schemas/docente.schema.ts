import { z } from "zod";

const optStr = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const docenteCreateSchema = z.object({
  cveProf: z
    .string()
    .trim()
    .min(3, "La clave del profesor debe tener al menos 3 caracteres")
    .max(25, "La clave no debe exceder 25 caracteres"),

  divisionId: z.coerce.number().int().positive("Selecciona una división"),

  areaConProf: optStr(120),
  gradoPrefijo: z.string().trim().max(10).optional().or(z.literal("")),
  gradoEspecialidad: z.string().trim().max(150).optional().or(z.literal("")),


  nombreProf: z.string().trim().min(2, "Nombre requerido").max(120),
  apePatProf: z.string().trim().min(2, "Apellido paterno requerido").max(120),
  apeMatProf: optStr(120),

  contratoProf: optStr(80),
  cateProf: optStr(80),

  correoProf: z
    .string()
    .trim()
    .email("Correo inválido")
    .optional()
    .or(z.literal("")),
});

export const docenteUpdateSchema = docenteCreateSchema.extend({
  cveProf: z
    .string()
    .trim()
    .min(3, "La clave del profesor debe tener al menos 3 caracteres")
    .max(25, "La clave no debe exceder 25 caracteres"),

  divisionId: z.coerce.number().int().positive("Selecciona una división"),

  areaConProf: optStr(120),
  gradoPrefijo: z.string().trim().max(10).optional().or(z.literal("")),
  gradoEspecialidad: z.string().trim().max(150).optional().or(z.literal("")),


  nombreProf: z.string().trim().min(2, "Nombre requerido").max(120),
  apePatProf: z.string().trim().min(2, "Apellido paterno requerido").max(120),
  apeMatProf: optStr(120),

  contratoProf: optStr(80),
  cateProf: optStr(80),

  correoProf: z
    .string()
    .trim()
    .email("Correo inválido")
    .optional()
    .or(z.literal("")),
});

export const docenteToggleSchema = z.object({
  id: z.coerce.number().int().positive(),
});
