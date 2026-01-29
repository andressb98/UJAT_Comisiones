import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

import { usuarioCreateSchema, usuarioUpdateSchema } from '$lib/schemas/usuario.schema';
import { usuarioService } from '$lib/server/services/usuario.service';
import { unidadAdministrativaService } from '$lib/server/services/unidadAdministrativa.service';
import { RolCodigo } from '@prisma/client';

import { getAuditCtx } from '$lib/server/audit/auditContext';

function normalizeOptional(s: unknown) {
    const v = typeof s === 'string' ? s.trim() : '';
    return v.length ? v : null;
}

export const load: PageServerLoad = async ({ url, locals }) => {
    const userRole = locals.roles?.find(role => role.codigo) ?? null;
    const divisionId = locals.division?.id ?? null; 
    const divisionIdNum = divisionId ? Number(divisionId) : null;
    console.log('User Role from local:', userRole);
    console.log('Division ID from local:', divisionId);


    let filteredRoles: string[] = [];

    if (userRole?.codigo === 'SUPER_ADMIN') {
        filteredRoles = Object.values(RolCodigo).filter(role => role !== 'SUPER_ADMIN');
    } else if (userRole?.codigo === 'ADMIN_DIVISION') {
        filteredRoles = Object.values(RolCodigo).filter(role => ['SECRETARIA_DIVISION', 'COORDINADOR_UNIDAD', 'SERVICIO_SOCIAL'].includes(role));
    } else if (userRole?.codigo === 'SECRETARIA_DIVISION') {
        filteredRoles = Object.values(RolCodigo).filter(role => ['COORDINADOR_UNIDAD', 'SERVICIO_SOCIAL'].includes(role));
    } else if (userRole?.codigo === 'COORDINADOR_UNIDAD') {
        filteredRoles = Object.values(RolCodigo).filter(role => role === 'SERVICIO_SOCIAL');
    } else {
        filteredRoles = [];
    }

    console.log('Filtered Roles for user:', filteredRoles);

    const usuarios = await usuarioService.list({ q: url.searchParams.get('q') ?? '', divisionId: divisionIdNum });
    const permisos = locals.permisos ?? [];
    const unidades = await unidadAdministrativaService.list(
        { q: url.searchParams.get('q') ?? '', division: divisionIdNum },
        getAuditCtx({ locals })!
    );

    return { usuarios, permisos, unidades, roles: filteredRoles };
};




export const actions: Actions = {
    create: async (event) => {
        const { request } = event;
        const ctx = getAuditCtx(event);
        if (!ctx) return fail(401, { message: 'No autorizado' });

        const fd = await request.formData();
        const raw = {
            ...Object.fromEntries(fd),
            unidadId: fd.get('unidadId') ? Number(fd.get('unidadId')) : undefined,
        };

        console.log("Datos recibidos para creación de usuario:", raw); 

        const parsed = usuarioCreateSchema.safeParse(raw);
        console.log("Datos validados:", parsed); 

        if (!parsed.success) {
            console.log("Error de validación en el schema:", parsed.error.flatten()); 
            const errors = parsed.error.flatten().fieldErrors;
            return fail(400, {
                message: 'Datos inválidos',
                issues: errors,
                details: `Errores encontrados en los campos: ${Object.keys(errors).join(", ")}` 
            });
        }

        console.log("Datos validados correctamente. Creando usuario...");

        const correo = parsed.data.correo.trim().toLowerCase();
        if (await usuarioService.correoExists(correo)) {
            return fail(409, { message: 'Ya existe un usuario con ese correo.' });
        }

        await usuarioService.create({
            nombre: parsed.data.nombre,
            correo,
            password: parsed.data.password,
            rolCodigo: parsed.data.rolesId, 
            unidadId: parsed.data.unidadId
        }, ctx);

        return { ok: true };
    },

};
