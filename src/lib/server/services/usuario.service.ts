import { prisma } from "$lib/server/prisma";
import type { AuditCtx } from "./bitacora.service";
import { TipoMovimientoBitacora } from "@prisma/client";
import bcrypt from "bcryptjs";


type UsuarioCreateInput = {
    nombre: string;
    correo: string;
    passwordHash: string;
    activo: boolean;
    rol: string;
    unidadId?: number;
};

type UsuarioUpdateInput = {
    nombre: string;
    correo: string;
    passwordHash: string;
    roles: string[];
};

export const usuarioService = {
    async list(params?: { q?: string; divisionId?: number }) {
        const q = params?.q?.trim();
        const divisionId = params?.divisionId;

        return prisma.usuario.findMany({
            where: {
                // 1.Filtro de búsqueda (si existe 'q')
                ...(q ? {
                    OR: [
                        { nombre: { contains: q } },
                        { correo: { contains: q } },
                    ],
                } : {}),

                // 2.Filtro de División Obligatorio
                OR: [
                    { adminDivision: { unidadAdministrativaId: divisionId } },
                    { secretaria: { unidadAdministrativaId: divisionId } },
                    { coordinador: { unidadId: divisionId } },
                    { servicioSocial: { some: { divisionId: divisionId } } },
                ]
            },
            orderBy: { creadoEn: "desc" },
        });
    },

    async correoExists(correo: string, excludeId?: number) {
        const found = await prisma.usuario.findFirst({
            where: { correo, ...(excludeId ? { id: { not: excludeId } } : {}) },
            select: { id: true }
        });
        return Boolean(found);
    },

    async create(data: any, ctx: AuditCtx) {
        const { nombre, correo, password, rolCodigo, unidadId } = data;

        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash(password, salt);

        return prisma.$transaction(async (tx) => {
            // 1. Obtener la división de la unidad seleccionada para garantizar consistencia
            const unidad = await tx.unidadAdministrativa.findUniqueOrThrow({
                where: { id: unidadId },
                select: { divisionId: true }
            });

            // 2. Crear el usuario base
            const usuario = await tx.usuario.create({
                data: {
                    nombre,
                    correo,
                    passwordHash: hashedPw, // Asegúrate de hashear esto
                    activo: true,
                }
            });

            // 3. Asignar el Rol
            const rol = await tx.rol.findUniqueOrThrow({ where: { codigo: rolCodigo } });
            await tx.usuarioRol.create({
                data: { usuarioId: usuario.id, rolId: rol.id }
            });

            // 4. Crear perfiles condicionales usando la divisionId de la unidad
            // Así evitamos que un Admin de DACAD cree alguien en DACBIOL por error de ID
            if (rolCodigo === 'ADMIN_DIVISION') {
                await tx.administradorDivision.create({
                    data: {
                        usuarioId: usuario.id,
                        divisionId: unidad.divisionId,
                        unidadAdministrativaId: unidadId
                    }
                });
            } else if (rolCodigo === 'SECRETARIA_DIVISION') {
                await tx.secretariaDivision.create({
                    data: {
                        usuarioId: usuario.id,
                        divisionId: unidad.divisionId,
                        unidadAdministrativaId: unidadId
                    }
                });
            } else if (rolCodigo === 'COORDINADOR_UNIDAD') {
                await tx.coordinadorUnidad.create({
                    data: {
                        usuarioId: usuario.id,
                        unidadId: unidadId
                    }
                });
            } else if (rolCodigo === 'SERVICIO_SOCIAL') {
                await tx.usuarioServicioSocial.create({
                    data: {
                        usuarioId: usuario.id,
                        divisionId: unidad.divisionId,
                        unidadAdministrativaId: unidadId
                    }
                });
            }

            await tx.bitacora.create({
                data: {
                    usuarioId: ctx.usuarioId,
                    ipOrigen: ctx.ipOrigen ?? null,
                    tipoMovimiento: TipoMovimientoBitacora.CREAR,
                    tablaAfectada: "Docente",
                    registroId: usuario.id,
                    descripcion: `Creó docente ${usuario.nombre} (${usuario.correo})`,
                },
            });

            return usuario;
        });
    },

    async update(id: number, data: UsuarioUpdateInput, ctx: AuditCtx) {
        return prisma.$transaction(async (tx) => {
            const updated = await tx.usuario.update({
                where: { id },
                data,
            });

            await tx.bitacora.create({
                data: {
                    usuarioId: ctx.usuarioId,
                    ipOrigen: ctx.ipOrigen ?? null,
                    tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
                    tablaAfectada: "Usuario",
                    registroId: updated.id,
                    descripcion: `Actualizó usuario ${updated.nombre} (${updated.correo})`,
                },
            });

            return updated;
        });
    }
};
