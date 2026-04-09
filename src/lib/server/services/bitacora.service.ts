import { prisma } from "$lib/server/prisma";
import { TipoMovimientoBitacora } from "@prisma/client";

export type AuditCtx = {
  usuarioId: number;
  ipOrigen?: string | null;
  unidadAdministrativaId?: number | null;
  divId?: number | null;
};

export type BitacoraLogInput = {
  tipoMovimiento: TipoMovimientoBitacora;
  tablaAfectada?: string | null;
  registroId?: number | null;
  descripcion?: string | null;
};

export const bitacoraService = {
  async log(ctx: AuditCtx, input: BitacoraLogInput, tx: any = prisma) {
    if (!ctx.usuarioId) {
      throw new Error("No se puede registrar en bitácora sin un usuarioId");
    }

    return tx.bitacora.create({
      data: {
        usuarioId: ctx.usuarioId,
        ipOrigen: ctx.ipOrigen ?? null,
        tipoMovimiento: input.tipoMovimiento,
        tablaAfectada: input.tablaAfectada ?? null,
        registroId: input.registroId ?? null,
        descripcion: input.descripcion ?? null,
      },
    });
  },
};