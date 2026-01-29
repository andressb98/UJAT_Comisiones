  import type { Handle } from '@sveltejs/kit';
  import { clearSessionCookie, getAuthContextFromRequest } from '$lib/server/auth/auth.service';

  export const handle: Handle = async ({ event, resolve }) => {
    const ctx = await getAuthContextFromRequest(event.cookies);

    if (!ctx) {
      if (event.cookies.get('session')) clearSessionCookie(event.cookies);

      event.locals.user = null;
      event.locals.roles = [];
      event.locals.permisos = [];
      event.locals.division = null;
      event.locals.unidad = null;
    } else {
      event.locals.user = ctx.user;
      event.locals.roles = ctx.roles;
      event.locals.permisos = ctx.permisos;
      event.locals.division = ctx.division;
      event.locals.unidad = ctx.unidad;

      console.log('👤 USER:', ctx.user);
      console.log('🏷️ ROLES:', ctx.roles);
      console.log('🔐 PERMISOS:', ctx.permisos);
      console.log('🏢 DIVISIÓN:', ctx.division);
      console.log('🏫 UNIDAD:', ctx.unidad);

    }

    event.locals.hasPermiso = (p) => event.locals.permisos.includes(p);
    event.locals.hasRol = (r) => event.locals.roles.some((x) => x.codigo === r);

    return resolve(event);
  };
