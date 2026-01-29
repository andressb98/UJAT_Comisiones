
export const load = async ({ locals }) => {
  return {
    user: locals.user,
    roles: locals.roles,
    permisos: locals.permisos,
    division: locals.division,
    unidad: locals.unidad
  };
};
