import { prisma } from "$lib/server/prisma";
import { TipoMovimientoBitacora } from "@prisma/client";
import type { AuditCtx } from "./bitacora.service";
import { generateUniqueClave } from "$lib/utils/clave"; // Asegúrate de importar la función
import { bitacoraService } from "./bitacora.service";
import { parse } from "path";



export const comisionesService = {

    // Función auxiliar interna para verificar disponibilidad
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

    // 2. NUEVA FUNCIÓN: Obtener una comisión por ID con toda su información
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

    // 3. MÉTODO MODIFICADO: Se eliminó el parámetro idComision
    async list(params: {
        q?: string;
        includeInactive?: boolean;
        division: number
    }) {
        const q = params.q?.trim();
        const includeInactive = Boolean(params.includeInactive);
        const divisionId = params.division;
        const hoy = new Date();

        const comisiones = await prisma.comision.findMany({
            where: {
                divisionId: divisionId,
                ...(includeInactive ? {} : { estatus: "ACTIVA" }),
                ...(q ? {
                    OR: [
                        { claveComision: { contains: q } },
                        { observaciones: { contains: q } },
                    ],
                } : {}),
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

        // Transformamos los resultados para añadir la lógica de negocio
        return comisiones.map(comision => {
            let estadoTemporal = "PENDIENTE";

            // Asumiendo que tienes campos 'fechaInicio' y 'fechaFin' en tu esquema
            const inicio = new Date(comision.fechaInicio);
            const fin = new Date(comision.fechaFin || comision.fechaInicio);

            if (hoy > fin) {
                estadoTemporal = "FINALIZADA";
            } else if (hoy >= inicio && hoy <= fin) {
                estadoTemporal = "EN_PROCESO";
            }

            return {
                ...comision,
                estadoCalculado: estadoTemporal // Esta propiedad la usas en tu frontend
            };
        });
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
