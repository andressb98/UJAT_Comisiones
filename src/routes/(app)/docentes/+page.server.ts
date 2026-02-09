import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

import { docenteCreateSchema, docenteToggleSchema, docenteUpdateSchema } from "$lib/schemas/docente.schema";
import { docentesService } from "$lib/server/services/docente.service";

import { getAuditCtx } from "$lib/server/audit/auditContext";
import { prisma } from "$lib/server/prisma";
import { id } from "zod/locales";

function normalizeOptional(s: unknown) {
  const v = typeof s === "string" ? s.trim() : "";
  return v.length ? v : null;
}

function normalizeOptionalNumber(n: unknown) {
  if (n === "" || n === null || n === undefined) return null;
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : null;
}

export const load: PageServerLoad = async ({ url, parent, locals }) => {
  const q = url.searchParams.get("q") ?? "";
  const includeInactive = url.searchParams.get("all") === "1";
  const divisionIdParam = url.searchParams.get("divisionId");
  const divisionId = locals.division?.id;
  console.log("LOAD docentes HIT ✅");
  console.log({ q, includeInactive, divisionId });

  const docentes = await docentesService.list({ q, includeInactive, division: divisionId });

  // combos del form
  const [divisiones] = await Promise.all([
    prisma.division.findMany({ orderBy: { creadoEn: "desc" } }),
  ]);

  const parentData = await parent();
  const permisos = (parentData as any)?.permisos ?? [];

  return { docentes, q, includeInactive, divisionId, divisiones, permisos };
};

export const actions: Actions = {
  create: async (event) => {
    const { request } = event;

    const fd = await request.formData();
    const ctx = getAuditCtx(event);
    if (!ctx) return fail(401, { message: "No autorizado" });

    const raw = Object.fromEntries(fd);
    const parsed = docenteCreateSchema.safeParse(raw);

    if (!parsed.success) {
      return fail(400, { message: "Datos inválidos", issues: parsed.error.flatten() });
    }

    // (opcional) validar uniqueness en UI-friendly
    const exists = await docentesService.cveExists(parsed.data.cveProf.trim());
    if (exists) {
      return fail(400, {
        message: "Datos inválidos",
        issues: {
          fieldErrors: { cveProf: ["Esa clave ya existe."] },
          formErrors: [],
        },
      });
    }

    await docentesService.create(
      {
        cveProf: parsed.data.cveProf.trim(),
        divisionId: parsed.data.divisionId,

        areaConProf: normalizeOptional(parsed.data.areaConProf),
        gradoPrefijo: normalizeOptional(parsed.data.gradoPrefijo),
        gradoEspecialidad: normalizeOptional(parsed.data.gradoEspecialidad),

        nombreProf: parsed.data.nombreProf.trim(),
        apePatProf: parsed.data.apePatProf.trim(),
        apeMatProf: normalizeOptional(parsed.data.apeMatProf),

        contratoProf: normalizeOptional(parsed.data.contratoProf),
        cateProf: normalizeOptional(parsed.data.cateProf),
        correoProf: normalizeOptional(parsed.data.correoProf),
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

    console.log("Datos recibidos para la actualizacion:", raw);


    const parsed = docenteUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      console.log("eSTA LLEGANDO HASTA AQUI");

      return fail(400, { message: "Datos inválidos", issues: parsed.error.flatten() });
    }

    console.log("sI ESTA LEGANDO HASTA AQUI");

    await docentesService.update(parsed.data.cveProf, {
      divisionId: parsed.data.divisionId,

      areaConProf: normalizeOptional(parsed.data.areaConProf),
      gradoPrefijo: normalizeOptional(parsed.data.gradoPrefijo),
      gradoEspecialidad: normalizeOptional(parsed.data.gradoEspecialidad),

      nombreProf: parsed.data.nombreProf.trim(),
      apePatProf: parsed.data.apePatProf.trim(),
      apeMatProf: normalizeOptional(parsed.data.apeMatProf),

      contratoProf: normalizeOptional(parsed.data.contratoProf),
      cateProf: normalizeOptional(parsed.data.cateProf),
      correoProf: normalizeOptional(parsed.data.correoProf),
    }, ctx);
    console.log("Esta llegadno aqui esta fallando")
    return { ok: true };
  },

  toggle: async (event) => {
    const { request } = event;

    const fd = await request.formData();
    const raw = Object.fromEntries(fd);
    const ctx = getAuditCtx(event);
    if (!ctx) return fail(401, { message: "No autorizado" });

    const parsed = docenteToggleSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, { message: "Solicitud inválida" });
    }

    await docentesService.toggleActivo(parsed.data.id, ctx);
    return { ok: true };
  },
};
