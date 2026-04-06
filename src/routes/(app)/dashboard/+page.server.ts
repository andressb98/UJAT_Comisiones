import type { PageServerLoad } from './$types';
import { comisionesService } from "$lib/server/services/comision.service";

export const load: PageServerLoad = async ({ locals }) => {
    // 1. Definir el rango del mes actual por defecto
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    // Para el último día, avanzamos al siguiente mes y retrocedemos 1 día
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);

    // 2. Traer todas las comisiones del mes en una sola petición
    const comisionesMes = await comisionesService.list({
        fechaInicio: primerDiaMes.toISOString(),
        fechaFin: ultimoDiaMes.toISOString(),
        divisionId: locals.division?.id // Si manejas multi-tenant/divisiones
    });

    // 3. Inicializar contadores y estructuras de datos
    let activasHoy = 0;
    let canceladas = 0;
    const docentesUnicos = new Set();
    const lugaresUnicos = new Set();
    const proximasComisiones: any[] = [];
    const lineaTiempo: any[] = [];

    // 4. Procesar todo en un solo ciclo (O(n))
    comisionesMes.forEach(c => {
        const inicio = new Date(c.fechaInicio);
        const fin = new Date(c.fechaFin || c.fechaInicio);

        // a) ¿Está activa hoy?
        if (hoy >= inicio && hoy <= fin && c.estadoCalculado !== 'FINALIZADA') {
            activasHoy++;
        }

        // b) ¿Está cancelada? (Ajusta 'estatus' según tu esquema de Prisma)
        if (c.estatus === 'CANCELADA') {
            canceladas++;
        }

        // c) Contar docentes y lugares únicos usando Set()
        if (c.lugarId) lugaresUnicos.add(c.lugarId);
        c.docentesComision.forEach(dc => docentesUnicos.add(dc.docenteId));

        // d) Próximas comisiones (inician en el futuro, máximo 5)
        if (inicio > hoy && proximasComisiones.length < 5) {
            proximasComisiones.push({
                clave: c.claveComision,
                fecha: inicio.toLocaleDateString('es-MX', { timeZone: 'UTC' }),
                hora: c.horaInicio || 'N/A',
                tipo: c.tipoComision?.nombre || 'General',
                docente: c.docentesComision[0]?.docente?.nombreProf || 'Varios',
                lugar: c.lugar?.descripcion || 'No especificado'
            });
        }

        // e) Línea de tiempo (puedes usar la fecha de creación 'creadoEn')
        if (lineaTiempo.length < 5) {
            lineaTiempo.push({
                estatus: c.estadoCalculado, // Para la clase CSS (ej. pendiente, en_proceso)
                rangoFechas: `${inicio.toLocaleDateString('es-MX', {timeZone:'UTC'})}`,
                rangoHoras: `${c.horaInicio || ''} - ${c.horaFin || ''}`,
                tipo: c.tipoComision?.nombre,
                docente: c.docentesComision[0]?.docente?.nombreProf || 'Varios',
                lugar: c.lugar?.descripcion
            });
        }
    });

    // 5. Cálculo final de porcentajes
    const total = comisionesMes.length;
    const porcentajeCanceladas = total > 0 ? Math.round((canceladas / total) * 100) : 0;

    // 6. Retornar exactamente lo que espera tu +page.svelte
    return {
        stats: {
            activasHoy,
            esteMes: total,
            docentesInvolucrados: docentesUnicos.size,
            lugaresUtilizados: lugaresUnicos.size,
            porcentajeCanceladas
        },
        proximasComisiones,
        lineaTiempo
    };
};