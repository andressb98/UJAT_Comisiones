import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

import { unidadAdministrativaCreateSchema, unidadAdministrativaUpdateSchema } from "$lib/schemas/unidadAdministrativa.schema";
import { divisionCreateSchema } from "$lib/schemas/division.schema";

import { unidadAdministrativaService } from "$lib/server/services/unidadAdministrativa.service";
import { divisionService } from "$lib/server/services/division.services";

import { buildClaveFromDescripcion } from "$lib/utils/clave";

import { getAuditCtx } from "$lib/server/audit/auditContext";

function normalizeOptional(s: unknown) {
    const v = typeof s === "string" ? s.trim() : "";
    return v.length ? v : null;
}

// Genera clave UNIQUE dentro de una división (por @@unique([clave, divisionId]))
async function generateUniqueClaveUnidad(siglas: string, divisionId: number) {
    for (let i = 0; i < 10; i++) {
        const clave = buildClaveFromDescripcion(siglas || "UNIDAD");

        const exists = await unidadAdministrativaService.claveExistsInDivision(clave, divisionId);
        if (!exists) return clave;
    }

    const base = buildClaveFromDescripcion(siglas || "UNIDAD");
    return `${base}${String(Date.now()).slice(-2)}`;
}

// Genera clave UNIQUE global para División (clave @unique)
async function generateUniqueClaveDivision(siglas: string) {
    for (let i = 0; i < 12; i++) {
        const base = buildClaveFromDescripcion(siglas || "DIV");
        const clave = i === 0 ? base : `${base}${i}`;
        const exists = await divisionService.claveExists(clave);
        if (!exists) return clave;
    }
    const base = buildClaveFromDescripcion(siglas || "DIV");
    return `${base}${String(Date.now()).slice(-2)}`;
}

export const load: PageServerLoad = async ({ url, locals }) => {
    const q = url.searchParams.get("q") ?? "";
    const divisionId = locals.division?.id ?? null;  // Usa locals.division.id si está disponible
    const divisionIdNum = divisionId ? Number(divisionId) : null;

    console.log("LOAD unidadesAdministrativas HIT ✅");
    console.log({ q, divisionId, divisionIdNum });

    const [unidades, divisiones] = await Promise.all([
        unidadAdministrativaService.list(
            { q, division: divisionIdNum && !Number.isNaN(divisionIdNum) ? divisionIdNum : null },
            getAuditCtx({ locals })!
        ),
        divisionService.list(),
    ]);

    const permisos = (locals as any).permisos ?? [];
    console.log("unidades administrativas ", unidades);

    return { unidades, divisiones, q, divisionId: divisionIdNum, permisos };
};



export const actions: Actions = {
    create: async (event) => {
        console.log("ACTION create unidadAdministrativa HIT ✅");

        const { request } = event;

        const fd = await request.formData();
        const raw = Object.fromEntries(fd);

        const ctx = getAuditCtx(event);
        if (!ctx) return fail(401, { message: "No autorizado" });


        const parsed = unidadAdministrativaCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return fail(400, { message: "Datos inválidos", issues: parsed.error.flatten() });
        }

        const siglas = parsed.data.siglas.trim().toUpperCase();
        const divisionId = parsed.data.divisionId;

        const siglasTaken = await unidadAdministrativaService.siglasExistsInDivision(siglas, divisionId);
        if (siglasTaken) {
            return fail(409, { message: "Ya existe una unidad con esas siglas en esa división." });
        }

        const clave = await generateUniqueClaveUnidad(siglas, divisionId);

        await unidadAdministrativaService.create({
            clave,
            siglas,
            descripcion: normalizeOptional(parsed.data.descripcion),
            divisionId,
        }, ctx);

        return { ok: true };
    },

    update: async (event) => {
        const { request } = event;
        const { locals } = event;

        const ctx = getAuditCtx(event);
        if (!ctx) return fail(401, { message: "No autorizado" });

        const fd = await request.formData();
        const raw = Object.fromEntries(fd);

        const parsed = unidadAdministrativaUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return fail(400, { message: "Datos inválidos", issues: parsed.error.flatten() });
        }

        const siglas = parsed.data.siglas.trim();
        const divisionId = parsed.data.divisionId;

        const siglasTaken = await unidadAdministrativaService.siglasExistsInDivision(siglas, divisionId, parsed.data.id);
        if (siglasTaken) return fail(409, { message: "Ya existe una unidad con esas siglas en esa división." });

        await unidadAdministrativaService.update(parsed.data.id, {
            siglas,
            descripcion: normalizeOptional(parsed.data.descripcion),
            divisionId,
        }, ctx);

        return { ok: true };
    },

    // Modal: crear división rápida y devolverla para insertarla al <select>
    createDivisionQuick: async (event) => {
        const { request } = event;
        const { locals } = event;

        const ctx = getAuditCtx(event);
        if (!ctx) return fail(401, { message: "No autorizado" });

        const fd = await request.formData();
        const raw = Object.fromEntries(fd);

        const parsed = divisionCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return fail(400, { message: "Datos inválidos", issues: parsed.error.flatten() });
        }

        const siglas = parsed.data.siglas.trim();

        // siglas únicas globales (según tu modelo)
        const siglasTaken = await divisionService.siglasExists(siglas);
        if (siglasTaken) return fail(409, { message: "Ya existe una división con esas siglas." });

        const clave = await generateUniqueClaveDivision(siglas);

        const division = await divisionService.create({
            clave,
            siglas,
            descripcion: normalizeOptional(parsed.data.descripcion),
        }, ctx);

        return {
            ok: true,
            division: { id: division.id, clave: division.clave, siglas: division.siglas, descripcion: division.descripcion ?? null },
        };
    },
};
