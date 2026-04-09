import { prisma } from "$lib/server/prisma";
import type { AuditCtx } from "./bitacora.service";
import { TipoMovimientoBitacora } from "@prisma/client";
import { bitacoraService } from "./bitacora.service";

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

      await bitacoraService.log(ctx, {
        tipoMovimiento: TipoMovimientoBitacora.CREAR,
        tablaAfectada: "Division",
        registroId: created.id,
        descripcion: `Creó nueva división ${created.clave} (${created.siglas})`,
      }, tx);

      return created;
    });
  },

  async update(id: number, data: DivisionUpdateInput, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.division.update({
        where: { id },
        data,
      });

      await bitacoraService.log(ctx, {
        tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
        tablaAfectada: "Division",
        registroId: updated.id,
        descripcion: `Actualizó división ${updated.clave} (${updated.siglas})`,
      }, tx);

      return updated;
    });
  }
};
