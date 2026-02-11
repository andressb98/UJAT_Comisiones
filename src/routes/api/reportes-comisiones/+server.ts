import { json, error } from '@sveltejs/kit';
import { comisionesService } from '$lib/server/services/comision.service.js';
import { getAuditCtx } from '$lib/server/audit/auditContext';

export const GET = async (event) => {
    const ctx = getAuditCtx(event);
    if (!ctx) throw error(401, "No autorizado");

    const url = new URL(event.url);
    
    const params = {
        docenteId: url.searchParams.get('docenteId') ? Number(url.searchParams.get('docenteId')) : undefined,
        tipoComisionId: url.searchParams.get('tipoComisionId') ? Number(url.searchParams.get('tipoComisionId')) : undefined,
        lugarId: url.searchParams.get('lugarId') ? Number(url.searchParams.get('lugarId')) : undefined,
        fechaInicio: url.searchParams.get('fechaInicio') || undefined,
        fechaFin: url.searchParams.get('fechaFin') || undefined,
        unidadId: url.searchParams.get('unidadId') ? Number(url.searchParams.get('unidadId')) : undefined,
        divisionId: url.searchParams.get('divisionId') ? Number(url.searchParams.get('divisionId')) : undefined,
        estado: url.searchParams.get('estado') || undefined,
        q: url.searchParams.get('q') || undefined
    };

    try {
        const resultados = await comisionesService.list(params);
        return json(resultados);
    } catch (err: any) {
        throw error(500, err.message);
    }
};