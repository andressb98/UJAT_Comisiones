import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

// Servicios
import { comisionesService } from "$lib/server/services/comision.service";
import { docentesService } from "$lib/server/services/docente.service";
import { tiposComisionService } from "$lib/server/services/tipoComision.service";
import { lugaresService } from "$lib/server/services/lugar.service";

// Schemas y Utils
import { comisionCreateSchema } from "$lib/schemas/comision.schema"; // Asegúrate de tener este schema creado
import { getAuditCtx } from "$lib/server/audit/auditContext";
import { tipoComisionCreateSchema } from "$lib/schemas/tipoComision.schema";
import { lugarCreateSchema } from "$lib/schemas/lugar.schema";
import { createDecipheriv } from "crypto";
import { stringFormat, success } from "zod";

// --- Helpers ---
// Genera una clave única: Ej. COM-1706123456
async function generateUniqueClave() {
    const prefix = "COM";
    for (let i = 0; i < 10; i++) {
        const suffix = String(Date.now()).slice(-6) + Math.floor(Math.random() * 10);
        const clave = `${prefix}-${suffix}`;

        const exists = await comisionesService.claveExists(clave);
        if (!exists) return clave;
    }
    return `${prefix}-${Date.now()}`;
}

// --- Load Function ---
export const load: PageServerLoad = async ({ url, locals }) => {
    const q = url.searchParams.get("q") ?? "";

    const [comisiones, docentes, tiposComision, lugares] = await Promise.all([
        comisionesService.list({ q, includeInactive: false, division: locals.division?.id }), // Carga las comisiones
        docentesService.list({ q, includeInactive: false, division: locals.division?.id }), // Carga los docentes
        tiposComisionService.list({ includeInactive: false }),
        lugaresService.list({ includeInactive: false })
    ]);
    const permisos = (locals as any).permisos ?? [];

    return {
        comisiones,
        docentes,
        tiposComision,
        lugares,
        q
    };
};

// --- Actions ---
export const actions: Actions = {
    create: async (event) => {
        const { request } = event;
    
        const fd = await request.formData();
        const ctx = getAuditCtx(event);
        if (!ctx) return fail(401, { message: "No autorizado" });
    
        const raw = Object.fromEntries(fd);
        const parsed = comisionCreateSchema.safeParse(raw);
    
        if (!parsed.success) {
            return fail(400, {
                message: "Datos inválidos",
                issues: parsed.error.flatten(),
                values: raw
            });
        }
    
        try {

            const { id } = await comisionesService.create({
                folio: parsed.data.folio,
                docenteId: parsed.data.docenteId,
                tipoComisionId: parsed.data.tipoComisionId,
                lugarId: parsed.data.lugarId,
                fechaInicio: new Date(parsed.data.fechaInicio),
                fechaFin: parsed.data.fechaFin ? new Date(parsed.data.fechaFin) : null,
                horaInicio: parsed.data.horaInicio,
                horaFin: parsed.data.horaFin,
                comentarios: parsed.data.comentarios || null,
                divisionId: parsed.data.divisionId,
                unidadAdministrativaId: parsed.data.unidadId
            }, ctx);
    
            const comisionCompleta = await comisionesService.getById(id);
    
            return {
                ok: true,
                comision: comisionCompleta
            };
        } catch (error: any) {
            console.error("Error creando comisión:", error);
            return fail(400, { 
                message: error.message || "Error interno al guardar la comisión." 
            });
        }
    },
    createTipoComision: async (event) => {
        const fd = await event.request.formData();
        const raw = Object.fromEntries(fd);
        const ctx = getAuditCtx(event);

        const parsed = tipoComisionCreateSchema.safeParse(raw);
        if (!parsed.success) return fail(400, { issues: parsed.error.flatten() });

        try {
            const clave = await generateUniqueClave(); // Reutiliza tu función
            const nuevo = await tiposComisionService.create({
                clave,
                nombre: parsed.data.nombre,
                descripcion: parsed.data.descripcion
            }, ctx!);
            return { ok: true, nuevo };
        } catch (e) {
            return fail(500, { message: "Error al crear tipo" });
        }
    },

    createLugar: async (event) => {
        const fd = await event.request.formData();
        const raw = Object.fromEntries(fd);
        const ctx = getAuditCtx(event);

        const parsed = lugarCreateSchema.safeParse(raw);
        if (!parsed.success) return fail(400, { issues: parsed.error.flatten() });

        try {
            const clave = "LUG-" + Date.now().toString().slice(-6); // Clave rápida para lugar
            const nuevo = await lugaresService.create({
                clave,
                descripcion: parsed.data.descripcion,
            }, ctx!);
            return { ok: true, nuevo };
        } catch (e) {
            return fail(500, { message: "Error al crear lugar" });
        }
    },
    update: async (event) => {
        const { request } = event;
        const fd = await request.formData();
        const raw = Object.fromEntries(fd);

        const ctx = getAuditCtx(event);
        if (!ctx) return fail(401, { message: "No autorizado" });

        const id = Number(raw.id);
        if (!id) return fail(400, { message: "ID de comisión no proporcionado" });

        const parsed = comisionCreateSchema.safeParse(raw);

        if (!parsed.success) {
            return fail(400, {
                message: "Datos inválidos",
                issues: parsed.error.flatten(),
                values: raw
            });
        }

        try {
            await comisionesService.update(id, {
                folio: parsed.data.folio,
                tipoComisionId: Number(parsed.data.tipoComisionId),
                lugarId: Number(parsed.data.lugarId),
                fechaInicio: new Date(parsed.data.fechaInicio + 'T00:00:00'),
                fechaFin: parsed.data.fechaFin ? new Date(parsed.data.fechaFin) : null,
                horaInicio: parsed.data.horaInicio,
                horaFin: parsed.data.horaFin,
                comentarios: parsed.data.comentarios || null,
            }, ctx);

            return { ok: true };

        } catch (error) {
            console.error("Error actualizando comisión:", error);
            return fail(500, { message: "Error interno al actualizar la comisión." });
        }
    },
};
