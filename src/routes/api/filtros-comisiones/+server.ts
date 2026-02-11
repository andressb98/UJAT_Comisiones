import { json, error } from '@sveltejs/kit';
import { getAuditCtx } from '$lib/server/audit/auditContext';
import { docentesService } from '$lib/server/services/docente.service.js';
import { tiposComisionService } from '$lib/server/services/tipoComision.service';
import { lugaresService } from '$lib/server/services/lugar.service';
import { unidadAdministrativaService } from '$lib/server/services/unidadAdministrativa.service.js'; // Ajustado el nombre según tu export
import { divisionService } from '$lib/server/services/division.services.js';

export const GET = async (event) => {
    const ctx = getAuditCtx(event);
    if (!ctx) throw error(401, "No autorizado");

    try {
        const [
            docentes,
            tipos,
            lugares,
            unidades,
            divisiones
        ] = await Promise.all([
            docentesService.list({}),
            tiposComisionService.list({}),
            lugaresService.list({}),
            unidadAdministrativaService.list({}, ctx), 
            divisionService.list({})
        ]);

        return json({
            docentes,
            tipos,
            lugares,
            unidades,
            divisiones
        });

    } catch (err: any) {
        console.error("Error en API filtros-comisiones:", err);
        throw error(500, err.message || "Error interno del servidor");
    }
};