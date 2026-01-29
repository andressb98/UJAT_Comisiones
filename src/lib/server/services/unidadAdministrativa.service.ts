import { prisma } from "$lib/server/prisma";
import type { AuditCtx } from "./bitacora.service";
import { TipoMovimientoBitacora } from "@prisma/client";



type UnidadAdministrativaCreateInput = {
  clave: string;
  siglas: string;
  descripcion?: string | null;
  divisionId: number;
};

type UnidadAdministrativaUpdateInput = Omit<UnidadAdministrativaCreateInput, "clave" | "divisionId"> & {
  divisionId: number;
};

export const unidadAdministrativaService = {
  async list(params: { q?: string; division?: number | null }, ctx: AuditCtx) {
    const q = params.q?.trim();

    return prisma.unidadAdministrativa.findMany({
      where: {
        ...(params.division ? { divisionId: params.division } : {}),  // Filtra solo las unidades de la división del usuario
        ...(q
          ? {
            OR: [
              { clave: { contains: q } },
              { siglas: { contains: q } },
              { descripcion: { contains: q } },
              { division: { descripcion: { contains: q } } },
              { division: { siglas: { contains: q } } },
              { division: { clave: { contains: q } } },
            ],
          }
          : {}),
      },
      include: {
        division: { select: { id: true, clave: true, siglas: true, descripcion: true } },
      },
      orderBy: { creadoEn: "desc" },
    });
  },


  async claveExistsInDivision(clave: string, divisionId: number) {
    const found = await prisma.unidadAdministrativa.findFirst({
      where: { clave, divisionId },
      select: { id: true },
    });
    return Boolean(found);
  },

  async siglasExistsInDivision(siglas: string, divisionId: number, exceptId?: number) {
    const found = await prisma.unidadAdministrativa.findFirst({
      where: {
        siglas,
        divisionId,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(found);
  },

  async create(data: UnidadAdministrativaCreateInput, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.unidadAdministrativa.create({ data });

      await tx.bitacora.create({
        data: {
          usuarioId: ctx.usuarioId,
          ipOrigen: ctx.ipOrigen ?? null,
          tipoMovimiento: TipoMovimientoBitacora.CREAR,
          tablaAfectada: "UnidadAdministrativa",
          registroId: created.id,
          descripcion: `Creó unidad administrativa ${created.clave} (${created.siglas})`,
        },
      });

      return created;
    });
  },


  async update(id: number, data: UnidadAdministrativaUpdateInput, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.unidadAdministrativa.update({
        where: { id },
        data,
      });

      await tx.bitacora.create({
        data: {
          usuarioId: ctx.usuarioId,
          ipOrigen: ctx.ipOrigen ?? null,
          tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
          tablaAfectada: "UnidadAdministrativa",
          registroId: updated.id,
          descripcion: `Actualizó unidad administrativa ${updated.clave} (${updated.siglas})`,
        },
      });

      return updated;
    });
  },
};
