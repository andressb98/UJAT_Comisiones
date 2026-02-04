import { json, error } from '@sveltejs/kit';
import { comisionesService } from "$lib/server/services/comision.service";
import { getAuditCtx } from "$lib/server/audit/auditContext";

export const GET = async (event) => {
    const { params } = event;
    const ctx = getAuditCtx(event);
    
    if (!ctx) throw error(401, "No autorizado");

    try {
        const id = parseInt(params.id);
        if (isNaN(id)) throw error(400, "ID inválido");

        const comision = await comisionesService.getById(id);

        return json(comision);
    } catch (err: any) {
        console.error(err);
        throw error(404, err.message || "Comisión no encontrada");
    }
};