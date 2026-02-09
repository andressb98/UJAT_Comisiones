import {json, error} from '@sveltejs/kit';
import { getAuditCtx } from '$lib/server/audit/auditContext';
import { docentesService } from '$lib/server/services/docentes.service';
import { tiposComisionService } from '$lib/server/services/tipoComision.service';
import { lugaresService } from '$lib/server/services/lugar.service';
import { unidadesService } from '$lib/server/services/unidad.service';
import { divisionesService } from '$lib/server/services/division.service';

export const GET = async (event) => {
    const {params} = event;
    const ctx = getAuditCtx(event);
    if (!ctx) throw error (401, "No autorizado");

    try{

        const docente = await docentesService.list();
        const tipoComision = await tiposComisionService.list();

    }catch(error: any){
        console.error(error);
        throw error(404, error.message || "Fallo algo pa");
    }
}