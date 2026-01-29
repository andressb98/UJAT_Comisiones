export function hasPermiso(
  permisos: string[] | undefined,
  permiso: string
): boolean {
  if (!permisos) return false;
  return permisos.includes(permiso);
}
