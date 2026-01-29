import { z } from "zod";

// Enum para las frecuencias de repetición de la comisión
export const frecuenciaRepeticionEnum = z.enum(["DIARIA", "SEMANAL", "MENSUAL", "ANUAL", "OTRO"]);

// Enum para el estado de la comisión
export const estatusComisionEnum = z.enum(["ACTIVA", "CANCELADA", "CERRADA"]);

// Schema para crear una comisión
export const comisionCreateSchema = z.object({
  docenteId: z.coerce.number().int().positive("El ID del docente debe ser un número positivo").optional(),
  tipoComisionId: z.coerce.number().int().positive("El ID del tipo de comisión debe ser un número positivo").optional(),
  lugarId: z.coerce.number().int().positive("El ID del lugar debe ser un número positivo").optional(),
  fechaInicio: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Fecha de inicio inválida" }),
  fechaFin: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Fecha de fin inválida" }).optional(),
  horaInicio: z.string().min(5, "La hora de inicio debe tener al menos 5 caracteres").max(5, "La hora de inicio no puede superar los 5 caracteres"),
  horaFin: z.string().min(5, "La hora de fin debe tener al menos 5 caracteres").max(5, "La hora de fin no puede superar los 5 caracteres").optional(),
  comentarios: z.string().max(255).optional(),
  frecuenciaRepeticion: frecuenciaRepeticionEnum.optional(),
  estatus: estatusComisionEnum.optional().default("ACTIVA"),
  divisionId: z.coerce.number().int().positive("Selecciona una división válida"),
  unidadId: z.coerce.number().int().positive("Selecciona una unidad válida"),
});
