import { prisma } from "$lib/server/prisma";
import type { AuditCtx } from "./bitacora.service";
import { TipoMovimientoBitacora } from "@prisma/client";

type DivisionCreateInput = {
  clave: string;
  siglas: string;
  descripcion?: string | null;
};

type DivisionUpdateInput = {
  siglas: string;
  descripcion?: string | null;
};

export const divisionService = {
  async list(params?: { q?: string }) {
    const q = params?.q?.trim();

    return prisma.division.findMany({
      where: q
        ? {
          OR: [
            { clave: { contains: q } },
            { siglas: { contains: q } },
            { descripcion: { contains: q } },
          ],
        }
        : {},
      orderBy: { creadoEn: "desc" },
    });
  },

  async claveExists(clave: string) {
    const found = await prisma.division.findUnique({ where: { clave } });
    return Boolean(found);
  },

  async siglasExists(siglas: string, excludeId?: number) {
    const found = await prisma.division.findFirst({
      where: { siglas, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true }
    });
    return Boolean(found);
  },

  async create(data: DivisionCreateInput, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.division.create({ data });

      await tx.bitacora.create({
        data: {
          usuarioId: ctx.usuarioId,
          ipOrigen: ctx.ipOrigen ?? null,
          tipoMovimiento: TipoMovimientoBitacora.CREAR,
          tablaAfectada: "Division",
          registroId: created.id,
          descripcion: `Creó división ${created.clave} (${created.siglas})`,
        },
      });

      return created;
    });
  },

  async update(id: number, data: DivisionUpdateInput, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.division.update({
        where: { id },
        data,
      });

      await tx.bitacora.create({
        data: {
          usuarioId: ctx.usuarioId,
          ipOrigen: ctx.ipOrigen ?? null,
          tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
          tablaAfectada: "Division",
          registroId: updated.id,
          descripcion: `Actualizó división ${updated.clave} (${updated.siglas})`,
        },
      });

      return updated;
    });
  }
};
