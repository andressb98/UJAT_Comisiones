import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { lugarCreateSchema, lugarToggleSchema, lugarUpdateSchema } from "$lib/schemas/lugar.schema";
import { lugaresService } from "$lib/server/services/lugar.service";
import { buildClaveFromDescripcion } from "$lib/utils/clave";
import { getAuditCtx } from "$lib/server/audit/auditContext";


function normalizeOptional(s: unknown) {
  const v = typeof s === "string" ? s.trim() : "";
  return v.length ? v : null;
}

async function generateUniqueClave(descripcion: string) {
  for (let i = 0; i < 10; i++) {
    const clave = buildClaveFromDescripcion(descripcion || "LUGAR");
    const exists = await lugaresService.claveExists(clave);
    if (!exists) return clave;
  }
  const base = buildClaveFromDescripcion(descripcion || "LUGAR");
  return `${base}${String(Date.now()).slice(-2)}`;
}

export const load: PageServerLoad = async ({ url }) => {
  const q = url.searchParams.get("q") ?? "";
  const includeInactive = url.searchParams.get("all") === "1";

  const lugares = await lugaresService.list({ q, includeInactive });

  return { lugares, q, includeInactive };
};

export const actions: Actions = {
  create: async (event) => {
    const { request } = event;

    const fd = await request.formData();
    const ctx = getAuditCtx(event);
    if (!ctx) return fail(401, { message: "No autorizado" });

    const raw = Object.fromEntries(fd);
    const parsed = lugarCreateSchema.safeParse(raw);

    if (!parsed.success) {
      return fail(400, { message: "Datos inválidos", issues: parsed.error.flatten() });
    }

    const descripcion = (parsed.data.descripcion || "").trim();
    const clave = await generateUniqueClave(descripcion || "LUGAR");

    await lugaresService.create(
      {
        clave,
        descripcion: normalizeOptional(parsed.data.descripcion),
        tipoUbicacion: parsed.data.tipoUbicacion ?? null,
        edificio: normalizeOptional(parsed.data.edificio),
        salonOficinaAula: normalizeOptional(parsed.data.salonOficinaAula),
        municipioCiudad: normalizeOptional(parsed.data.municipioCiudad),
        coloniaBarrio: normalizeOptional(parsed.data.coloniaBarrio),
      },
      ctx
    );

    return { ok: true };
  },

  update: async (event) => {
    const { request } = event;

    const fd = await request.formData();
    const raw = Object.fromEntries(fd);
    const ctx = getAuditCtx(event);
    if (!ctx) return fail(401, { message: "No autorizado" });

    const parsed = lugarUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, { message: "Datos inválidos", issues: parsed.error.flatten() });
    }

    await lugaresService.update(
      parsed.data.id,
      {
        descripcion: normalizeOptional(parsed.data.descripcion),
        tipoUbicacion: parsed.data.tipoUbicacion ?? null,
        edificio: normalizeOptional(parsed.data.edificio),
        salonOficinaAula: normalizeOptional(parsed.data.salonOficinaAula),
        municipioCiudad: normalizeOptional(parsed.data.municipioCiudad),
        coloniaBarrio: normalizeOptional(parsed.data.coloniaBarrio),
      },
      ctx
    );

    return { ok: true };
  },

  toggle: async (event) => {
    const { request } = event;

    const fd = await request.formData();
    const raw = Object.fromEntries(fd);
    const ctx = getAuditCtx(event);
    if (!ctx) return fail(401, { message: "No autorizado" });

    const parsed = lugarToggleSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, { message: "Solicitud inválida" });
    }

    await lugaresService.toggleActivo(parsed.data.id, ctx);
    return { ok: true };
  },
};

