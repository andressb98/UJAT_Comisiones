import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

import { divisionCreateSchema, divisionUpdateSchema } from '$lib/schemas/division.schema';
import { divisionService } from '$lib/server/services/division.services';

import { buildClaveFromDescripcion } from '$lib/utils/clave';
import { getAuditCtx } from '$lib/server/audit/auditContext';

function normalizeOptional(s: unknown) {
    const v = typeof s === 'string' ? s.trim() : '';
    return v.length ? v : null;
}

// Genera clave UNIQUE global para División (clave @unique)
async function generateUniqueClaveDivision(siglas: string) {
    for (let i = 0; i < 12; i++) {
        const base = buildClaveFromDescripcion(siglas || 'DIV');
        const clave = i === 0 ? base : `${base}${i}`;
        const exists = await divisionService.claveExists(clave);
        if (!exists) return clave;
    }
    const base = buildClaveFromDescripcion(siglas || 'DIV');
    return `${base}${String(Date.now()).slice(-2)}`;
}

export const load: PageServerLoad = async ({ url, locals }) => {
    const q = url.searchParams.get('q') ?? '';

    const divisiones = await divisionService.list({ q });

    const permisos = (locals as any).permisos ?? [];

    return { divisiones, q, permisos };
};

export const actions: Actions = {
    create: async (event) => {
        const { request } = event;

        const ctx = getAuditCtx(event);
        if (!ctx) return fail(401, { message: 'No autorizado' });

        const fd = await request.formData();
        const raw = Object.fromEntries(fd);

        const parsed = divisionCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return fail(400, { message: 'Datos inválidos', issues: parsed.error.flatten() });
        }

        const siglas = parsed.data.siglas.trim().toUpperCase();

        const siglasTaken = await divisionService.siglasExists(siglas);
        if (siglasTaken) return fail(409, { message: 'Ya existe una división con esas siglas.' });

        const clave = await generateUniqueClaveDivision(siglas);

        await divisionService.create(
            {
                clave,
                siglas,
                descripcion: normalizeOptional(parsed.data.descripcion)
            },
            ctx
        );

        return { ok: true };
    },

    update: async (event) => {
        const { request } = event;

        const ctx = getAuditCtx(event);
        if (!ctx) return fail(401, { message: 'No autorizado' });

        const fd = await request.formData();
        const raw = Object.fromEntries(fd);

        const parsed = divisionUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return fail(400, { message: 'Datos inválidos', issues: parsed.error.flatten() });
        }

        const siglas = parsed.data.siglas.trim().toUpperCase();

        const taken = await divisionService.siglasExists(siglas, parsed.data.id);
        if (taken) return fail(409, { message: 'Ya existe una división con esas siglas.' });
        const current = (await divisionService.list({ q: '' })).find((d) => d.id === parsed.data.id);
        if (!current) return fail(404, { message: 'No existe la división.' });

        if (current.siglas !== siglas) {
            const siglasTaken = await divisionService.siglasExists(siglas);
            if (siglasTaken) return fail(409, { message: 'Ya existe una división con esas siglas.' });
        }

        await divisionService.update(
            parsed.data.id,
            {
                siglas,
                descripcion: normalizeOptional(parsed.data.descripcion)
            },
            ctx
        );

        return { ok: true };
    }
};
