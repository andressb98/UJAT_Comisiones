import { z } from 'zod';

// En su archivo de esquemas
export const usuarioCreateSchema = z.object({
  nombre: z.string().min(3),
  correo: z.string().email(),
  password: z.string().min(6),
  rolesId: z.string(), // El rol seleccionado
  unidadId: z.coerce.number() // El ID de la unidad administrativa
});

export const usuarioUpdateSchema = usuarioCreateSchema.extend({
  id: z.coerce.number(),
  password: z.string().optional() // Password opcional en edición
});
