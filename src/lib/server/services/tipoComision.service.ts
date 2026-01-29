import { prisma } from "$lib/server/prisma";
import type { AuditCtx } from "./bitacora.service";
import { TipoMovimientoBitacora } from "@prisma/client";

type TipoComisionCreateInput = {
  clave: string;
  nombre: string;
  descripcion?: string | null;
  departamentoCreador?: string | null;
};

type TipoComisionUpdateInput = Omit<TipoComisionCreateInput, "clave">;

export const tiposComisionService = {
  async list(params: { q?: string; includeInactive?: boolean }) {
    const q = params.q?.trim();
    const includeInactive = Boolean(params.includeInactive);

    return prisma.tipoComision.findMany({
      where: {
        ...(includeInactive ? {} : { activo: true }),
        ...(q
          ? {
              OR: [
                { clave: { contains: q } },
                { nombre: { contains: q } },
                { descripcion: { contains: q } },
                { departamentoCreador: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { creadoEn: "desc" },
    });
  },

  async claveExists(clave: string) {
    const found = await prisma.tipoComision.findUnique({ where: { clave } });
    return Boolean(found);
  },

  async create(data: TipoComisionCreateInput, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.tipoComision.create({ data });

      await tx.bitacora.create({
        data: {
          usuarioId: ctx.usuarioId,
          ipOrigen: ctx.ipOrigen ?? null,
          tipoMovimiento: TipoMovimientoBitacora.CREAR,
          tablaAfectada: "TipoComision",
          registroId: created.id,
          descripcion: `Creó tipo de comisión ${created.clave} (${created.nombre})`,
        },
      });

      return created;

    });
  },

  async update(id: number, data: TipoComisionUpdateInput, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.tipoComision.update({
        where: { id },
        data,
      });

      await tx.bitacora.create({
        data: {
          usuarioId: ctx.usuarioId,
          ipOrigen: ctx.ipOrigen ?? null,
          tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
          tablaAfectada: "TipoComision",
          registroId: updated.id,
          descripcion: `Actualizó tipo de comisión ${updated.clave} (${updated.nombre})`,
        },
      });

      return updated;
    });
  },

  async toggleActivo(id: number, ctx: AuditCtx) {
    const current = await prisma.tipoComision.findUnique({ where: { id } });
    if (!current) throw new Error("Tipo de comisión no encontrado");

    return prisma.$transaction(async (tx) => {
      const updated = await tx.tipoComision.update({
        where: { id },
        data: { activo: !current.activo },
      });

      await tx.bitacora.create({
        data: {
          usuarioId: ctx.usuarioId,
          ipOrigen: ctx.ipOrigen ?? null,
          tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
          tablaAfectada: "TipoComision",
          registroId: updated.id,
          descripcion: `Desactivó tipo de comisión ${updated.clave} (${updated.nombre})`,
        },
      });

      return updated;
    });
  },
};
