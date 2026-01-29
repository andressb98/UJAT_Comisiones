import { prisma } from "$lib/server/prisma";
import { TipoMovimientoBitacora } from "@prisma/client";
import type { AuditCtx } from "./bitacora.service";
import { generateUniqueClave } from "$lib/utils/clave"; // Asegúrate de importar la función
import { bitacoraService } from "./bitacora.service";



export const comisionesService = {

    // Función auxiliar interna para verificar disponibilidad
    async checkDisponibilidad(tx: any, params: { docenteId: number; fechaInicio: Date; fechaFin: Date; excludeId?: number }) {
        const { docenteId, fechaInicio, fechaFin, excludeId } = params;

        const traslape = await tx.comision.findFirst({
            where: {
                // Filtramos por el docente específico a través de la relación
                docentesComision: {
                    some: { docenteId: docenteId }
                },
                // Solo comisiones activas
                estatus: "ACTIVA",
                // Si estamos editando, ignoramos la comisión actual
                ...(excludeId ? { id: { not: excludeId } } : {}),
                // Lógica de traslape: (StartA <= EndB) AND (EndA >= StartB)
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
    // Método para crear una nueva comisión
    async create(data: any, ctx: AuditCtx) {
        return prisma.$transaction(async (tx) => {
            // 1. Validar disponibilidad antes de crear
            await this.checkDisponibilidad(tx, {
                docenteId: data.docenteId,
                fechaInicio: new Date(data.fechaInicio),
                fechaFin: new Date(data.fechaFin || data.fechaInicio)
            });

            const claveComision = await generateUniqueClave();

            const createdComision = await tx.comision.create({
                data: {
                    claveComision,
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

            await tx.bitacora.create({
                data: {
                    usuarioId: ctx.usuarioId,
                    ipOrigen: ctx.ipOrigen ?? null,
                    tipoMovimiento: TipoMovimientoBitacora.CREAR,
                    tablaAfectada: "Comision",
                    registroId: createdComision.id,
                    descripcion: `Creó comision ${createdComision.claveComision} (${createdComision.creadorId})`,
                },
            });


            // ... (resto de tu código de bitácora)
            return createdComision;
        });
    },

    // Método para verificar si la clave de la comisión ya existe
    async claveExists(clave: string) {
        const found = await prisma.comision.findUnique({
            where: { claveComision: clave },
            select: { id: true },
        });
        return Boolean(found);
    },

    // Método para obtener todas las comisiones, con un filtro opcional 'q' para la búsqueda
    async list(params: { q?: string; includeInactive?: boolean; division: number }) {
        const q = params.q?.trim();
        const includeInactive = Boolean(params.includeInactive);
        const divisionId = params.division; // Extraemos el ID de la división

        return prisma.comision.findMany({
            where: {
                divisionId: divisionId, // <-- Filtro obligatorio por división
                ...(includeInactive ? {} : { estatus: "ACTIVA" }),
                ...(q
                    ? {
                        OR: [
                            { claveComision: { contains: q } },
                            { observaciones: { contains: q } },
                        ],
                    }
                    : {}),
            },
            orderBy: { creadoEn: "desc" },
            include: {
                tipoComision: true,
                lugar: true,
                docentesComision: {
                    include: {
                        docente: true
                    }
                }
            },
        });
    },

    async update(id: number, data: any, ctx: AuditCtx) {
        return prisma.$transaction(async (tx) => {
            // 1. Para validar disponibilidad en update, necesitamos saber qué docente tiene la comisión
            // Si el data no trae el docenteId, lo buscamos de la base de datos
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
                    excludeId: id // Importante: excluir la comisión actual para que no choque consigo misma
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
                    descripcion: `Actualizó comision ${updatedComision.claveComision} (${updatedComision.creadorId})`,
                },
            });

            // ... (resto de tu código de bitácora)
            return updatedComision;
        });
    }
};
