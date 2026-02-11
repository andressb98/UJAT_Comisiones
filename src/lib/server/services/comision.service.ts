import { prisma } from "$lib/server/prisma";
import { TipoMovimientoBitacora } from "@prisma/client";
import type { AuditCtx } from "./bitacora.service";
import { generateUniqueClave } from "$lib/utils/clave"; 
import { bitacoraService } from "./bitacora.service";
import { parse } from "path";



export const comisionesService = {

    async checkDisponibilidad(tx: any, params: { docenteId: number; fechaInicio: Date; fechaFin: Date; excludeId?: number }) {
        const { docenteId, fechaInicio, fechaFin, excludeId } = params;

        const traslape = await tx.comision.findFirst({
            where: {
                docentesComision: {
                    some: { docenteId: docenteId }
                },
                estatus: "ACTIVA",
                ...(excludeId ? { id: { not: excludeId } } : {}),
                AND: [
                    { fechaInicio: { lte: fechaFin } },
                    { fechaFin: { gte: fechaInicio } }
                ]
            }
        });

        if (traslape) {
            throw new Error(`El docente ya tiene una comisión asignada en este rango de fechas (${traslape.claveComision})`);
        }
    },

    // 1. Crear una comisión
    async create(data: any, ctx: AuditCtx) {
        return prisma.$transaction(async (tx) => {
            // 1. Verificación de disponibilidad (ya lo tienes)
            await this.checkDisponibilidad(tx, {
                docenteId: data.docenteId,
                fechaInicio: new Date(data.fechaInicio),
                fechaFin: new Date(data.fechaFin || data.fechaInicio)
            });

            // 2. Consultar las siglas necesarias en paralelo para ganar velocidad
            const [division, unidad] = await Promise.all([
                tx.division.findUnique({
                    where: { id: data.divisionId },
                    select: { siglas: true }
                }),
                tx.unidadAdministrativa.findUnique({
                    where: { id: data.unidadAdministrativaId },
                    select: { siglas: true }
                })
            ]);

            // 3. Formatear el Folio
            // Usamos padStart para los ceros a la izquierda (0003, 0002)
            const folioFormatted = data.folio.toString().padStart(4, '0');
            const userIdFormatted = ctx.usuarioId.toString().padStart(4, '0');
            const siglasDiv = division?.siglas || 'SD'; // SD = Sin División
            const siglasUni = unidad?.siglas || 'SU'; // SU = Sin Unidad

            const nuevoFolioGenerado = `${folioFormatted}-${siglasDiv}-${siglasUni}-${userIdFormatted}`;

            // 4. Generar clave única (ya lo tienes)
            const claveComision = await generateUniqueClave();

            // 5. Crear la comisión con el nuevo folio
            const createdComision = await tx.comision.create({
                data: {
                    claveComision,
                    folio: nuevoFolioGenerado, // <-- Aquí insertamos el folio compuesto
                    tipoComisionId: data.tipoComisionId,
                    lugarId: data.lugarId,
                    fechaInicio: data.fechaInicio,
                    fechaFin: data.fechaFin,
                    horaInicio: data.horaInicio,
                    horaFin: data.horaFin,
                    observaciones: data.comentarios || null,
                    frecuenciaRepeticion: data.frecuenciaRepeticion || "UNICA",
                    unidadAdministrativaId: data.unidadAdministrativaId,
                    divisionId: data.divisionId,
                    creadorId: ctx.usuarioId,
                    docentesComision: {
                        create: { docenteId: data.docenteId },
                    },
                },
            });

            // 6. Bitácora (se mantiene igual)
            await tx.bitacora.create({
                data: {
                    usuarioId: ctx.usuarioId,
                    ipOrigen: ctx.ipOrigen ?? null,
                    tipoMovimiento: TipoMovimientoBitacora.CREAR,
                    tablaAfectada: "Comision",
                    registroId: createdComision.id,
                    descripcion: `Creó comision con folio ${nuevoFolioGenerado}`,
                },
            });

            return { id: createdComision.id };
        });
    },

    async getById(id: number) {
        const comision = await prisma.comision.findUnique({
            where: { id },
            include: {
                tipoComision: true,
                lugar: true,
                docentesComision: {
                    include: {
                        docente: true
                    }
                }
            }
        });

        if (!comision) {
            throw new Error(`No se encontró la comisión con ID ${id}`);
        }

        return comision;
    },

    async list(params: {
        q?: string;
        docenteId?: number;
        tipoComisionId?: number;
        lugarId?: number;
        fechaInicio?: string;
        fechaFin?: string;
        unidadId?: number;
        divisionId?: number;
        estado?: string; // PENDIENTE, EN_PROCESO, FINALIZADA
    }) {
        const hoy = new Date();

        // Construcción dinámica del filtro 'where'
        const where: any = {
            ...(params.divisionId ? { divisionId: params.divisionId } : {}),
            ...(params.unidadId ? { unidadAdministrativaId: params.unidadId } : {}),
            ...(params.tipoComisionId ? { tipoComisionId: params.tipoComisionId } : {}),
            ...(params.lugarId ? { lugarId: params.lugarId } : {}),

            // Filtro por Docente (Relación Many-to-Many)
            ...(params.docenteId ? {
                docentesComision: {
                    some: { docenteId: params.docenteId }
                }
            } : {}),

            // Filtro por Rango de Fechas
            ...(params.fechaInicio || params.fechaFin ? {
                AND: [
                    params.fechaInicio ? { fechaInicio: { gte: new Date(params.fechaInicio) } } : {},
                    params.fechaFin ? { fechaFin: { lte: new Date(params.fechaFin) } } : {}
                ]
            } : {}),

            ...(params.q ? {
                OR: [
                    { claveComision: { contains: params.q, mode: 'insensitive' } },
                    { folio: { contains: params.q, mode: 'insensitive' } },
                    { observaciones: { contains: params.q, mode: 'insensitive' } },
                ]
            } : {})
        };

        const comisiones = await prisma.comision.findMany({
            where,
            orderBy: { creadoEn: "desc" },
            include: {
                tipoComision: true,
                lugar: true,
                unidadAdministrativa: true,
                division: true,
                docentesComision: { include: { docente: true } }
            },
        });

        let resultados = comisiones.map(comision => {
            let estadoTemporal = "PENDIENTE";
            const inicio = new Date(comision.fechaInicio);
            const fin = new Date(comision.fechaFin || comision.fechaInicio);

            if (hoy > fin) {
                estadoTemporal = "FINALIZADA";
            } else if (hoy >= inicio && hoy <= fin) {
                estadoTemporal = "EN_PROCESO";
            }

            return { ...comision, estadoCalculado: estadoTemporal };
        });

        if (params.estado) {
            resultados = resultados.filter(r => r.estadoCalculado === params.estado);
        }

        return resultados;
    },

    async update(id: number, data: any, ctx: AuditCtx) {
        return prisma.$transaction(async (tx) => {
            let currentDocenteId = data.docenteId;
            if (!currentDocenteId) {
                const relacion = await tx.docenteComision.findFirst({ where: { comisionId: id } });
                currentDocenteId = relacion?.docenteId;
            }

            if (currentDocenteId) {
                await this.checkDisponibilidad(tx, {
                    docenteId: currentDocenteId,
                    fechaInicio: new Date(data.fechaInicio),
                    fechaFin: new Date(data.fechaFin || data.fechaInicio),
                    excludeId: id
                });
            }

            const updatedComision = await tx.comision.update({
                where: { id },
                data: {
                    tipoComisionId: data.tipoComisionId,
                    lugarId: data.lugarId,
                    fechaInicio: data.fechaInicio,
                    fechaFin: data.fechaFin,
                    horaInicio: data.horaInicio,
                    horaFin: data.horaFin,
                    observaciones: data.comentarios || null,
                },
            });

            await tx.bitacora.create({
                data: {
                    usuarioId: ctx.usuarioId,
                    ipOrigen: ctx.ipOrigen ?? null,
                    tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
                    tablaAfectada: "Comision",
                    registroId: updatedComision.id,
                    descripcion: `Actualizó comision ${updatedComision.claveComision}`,
                },
            });

            return updatedComision;
        });
    },

    async claveExists(clave: string) {
        const found = await prisma.comision.findUnique({
            where: { claveComision: clave },
            select: { id: true },
        });
        return Boolean(found);
    }
};
