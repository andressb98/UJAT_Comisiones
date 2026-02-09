import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import {
  tipoComisionCreateSchema,
  tipoComisionToggleSchema,
  tipoComisionUpdateSchema,
} from "$lib/schemas/tipoComision.schema";
import { tiposComisionService } from "$lib/server/services/tipoComision.service";
import { buildClaveFromDescripcion } from "$lib/utils/clave";
import { getAuditCtx } from "$lib/server/audit/auditContext";

function normalizeOptional(s: unknown) {
  const v = typeof s === "string" ? s.trim() : "";
  return v.length ? v : null;
}

// ✅ Toma el “departamento creador” desde el user logueado.
// Ajusta esto a la forma real de tu locals.user.
function getDepartamentoCreador(locals: App.Locals) {
  const u: any = locals.user;

  // Ejemplos típicos (ajusta según tu auth context):
  // - coordinador.unidad.descripcion
  // - adminDivision.division.descripcion
  // - unidadAdministrativa.descripcion
  return (
    u?.coordinador?.unidad?.descripcion ??
    u?.unidadAdministrativa?.descripcion ??
    u?.adminDivision?.division?.descripcion ??
    null
  );
}

async function generateUniqueClave(nombre: string) {
  for (let i = 0; i < 10; i++) {
    const clave = buildClaveFromDescripcion(nombre || "TIPO");
    const exists = await tiposComisionService.claveExists(clave);
    if (!exists) return clave;
  }
  const base = buildClaveFromDescripcion(nombre || "TIPO");
  return `${base}${String(Date.now()).slice(-2)}`;
}

export const load: PageServerLoad = async ({ url, locals }) => {
  const q = url.searchParams.get("q") ?? "";
  const includeInactive = url.searchParams.get("all") === "1";

  const tiposComision = await tiposComisionService.list({ q, includeInactive });

  // Si en tu app ya retornas permisos/usuario desde layout,
  // puedes omitirlos aquí. Si no, los incluyes:
  const permisos = (locals as any).permisos ?? [];
  return { tiposComision, q, includeInactive, permisos };
};

export const actions: Actions = {
  create: async (event) => {
    const { request } = event;

    const fd = await request.formData();
    const ctx = getAuditCtx(event);
    if (!ctx) return fail(401, { message: "No autorizado" });
    const { locals } = event;
    const raw = Object.fromEntries(fd);
    const parsed = tipoComisionCreateSchema.safeParse(raw);

    if (!parsed.success) {
      return fail(400, { message: "Datos inválidos", issues: parsed.error.flatten() });
    }

    const nombre = parsed.data.nombre.trim();
    const clave = await generateUniqueClave(nombre);

    const departamentoCreador = getDepartamentoCreador(locals);

    await tiposComisionService.create({
      clave,
      nombre,
      descripcion: normalizeOptional(parsed.data.descripcion),
      departamentoCreador,
    }, 
    ctx
  );

    return { ok: true };
  },

  update: async (event) => {
    const { request } = event;
    const { locals } = event;

    const fd = await request.formData();
    const raw = Object.fromEntries(fd);
    const ctx = getAuditCtx(event);
    if (!ctx) return fail(401, { message: "No autorizado" });

    const parsed = tipoComisionUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, { message: "Datos inválidos", issues: parsed.error.flatten() });
    }

    const departamentoCreador = getDepartamentoCreador(locals);

    await tiposComisionService.update(parsed.data.id, {
      nombre: parsed.data.nombre.trim(),
      descripcion: normalizeOptional(parsed.data.descripcion),
      // ✅ lo fijamos al del usuario logueado (como pediste)
      departamentoCreador,
    }, ctx);

    return { ok: true };
  },

  toggle: async (event) => {
    const { request } = event;

    const fd = await request.formData();
    const raw = Object.fromEntries(fd);

    const ctx = getAuditCtx(event);
    if (!ctx) return fail(401, { message: "No autorizado" });

    const parsed = tipoComisionToggleSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, { message: "Solicitud inválida" });
    }

    await tiposComisionService.toggleActivo(parsed.data.id, ctx);
    return { ok: true };
  },
};
