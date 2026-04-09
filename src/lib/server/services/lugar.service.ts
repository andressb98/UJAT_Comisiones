import type { TipoUbicacion, Prisma } from "@prisma/client";
import { prisma } from "$lib/server/prisma";
import type { AuditCtx } from "./bitacora.service";
import { TipoMovimientoBitacora } from "@prisma/client";
import { bitacoraService } from "./bitacora.service";

type LugarCreateInput = {
  clave: string;
  descripcion?: string | null;
  tipoUbicacion?: TipoUbicacion | null;
  edificio?: string | null;
  salonOficinaAula?: string | null;
  municipioCiudad?: string | null;
  coloniaBarrio?: string | null;
};

type LugarUpdateInput = Omit<LugarCreateInput, "clave">;

export const lugaresService = {
  async list(params: { q?: string; includeInactive?: boolean }) {
    const q = params.q?.trim();
    const includeInactive = Boolean(params.includeInactive);

    return prisma.lugar.findMany({
      where: {
        ...(includeInactive ? {} : { activo: true }),
        ...(q
          ? {
              OR: [
                { clave: { contains: q } },
                { descripcion: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { creadoEn: "desc" },
    });
  },

  async claveExists(clave: string) {
    const found = await prisma.lugar.findUnique({
      where: { clave },
      select: { id: true },
    });
    return Boolean(found);
  },

  async create(data: LugarCreateInput, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.lugar.create({ data });

      await bitacoraService.log(ctx, {
        tipoMovimiento: TipoMovimientoBitacora.CREAR,
        tablaAfectada: "Lugar",
        registroId: created.id,
        descripcion: `Creó nuevo lugar ${created.clave} - ${created.descripcion}`,
      }, tx);

      return created;
    });
  },

  async update(id: number, data: LugarUpdateInput, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.lugar.update({
        where: { id },
        data,
      });

      await bitacoraService.log(ctx, {
        tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
        tablaAfectada: "Lugar",
        registroId: updated.id,
        descripcion: `Actualizó lugar ${updated.clave} - ${updated.descripcion}`,
      }, tx);

      return updated;
    });
  },

  async toggleActivo(id: number, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.lugar.findUnique({
        where: { id },
        select: { id: true, clave: true, activo: true },
      });
      if (!current) throw new Error("Lugar no encontrado");

      const updated = await tx.lugar.update({
        where: { id },
        data: { activo: !current.activo },
        select: { id: true, clave: true, activo: true },
      });

      await bitacoraService.log(ctx, {
        tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
        tablaAfectada: "Lugar",
        registroId: updated.id,
        descripcion: `${updated.activo ? "Activó" : "Desactivó"} lugar ${updated.clave}`,
      }, tx);

      return updated;
    });
  },
};
