import { prisma } from "$lib/server/prisma";
import type { AuditCtx } from "./bitacora.service";
import { TipoMovimientoBitacora } from "@prisma/client";
import { bitacoraService } from "./bitacora.service";

type DocenteCreateInput = {
  cveProf: string;
  divisionId: number;
  areaConProf?: string | null;
  gradoPrefijo?: string | null;
  gradoEspecialidad?: string | null;
  nombreProf: string;
  apePatProf: string;
  apeMatProf?: string | null;
  contratoProf?: string | null;
  cateProf?: string | null;
  correoProf?: string | null;
};

type DocenteUpdateInput = Omit<DocenteCreateInput, "cveProf">;

export const docentesService = {

  async list(params: { q?: string; includeInactive?: boolean; division?: number | null }) {
    const q = params.q?.trim();
    const includeInactive = Boolean(params.includeInactive);

    return prisma.docente.findMany({
      where: {
        ...(params.division ? { divisionId: params.division } : {}),
        ...(includeInactive ? {} : { activo: true }),
        ...(q ? {
          OR: [
            { cveProf: { contains: q } },
            { nombreProf: { contains: q } },
            { apePatProf: { contains: q } },
            { apeMatProf: { contains: q } },
            { correoProf: { contains: q } },
            { gradoPrefijo: { contains: q } },
            { gradoEspecialidad: { contains: q } },
            { areaConProf: { contains: q } },
            { division: { descripcion: { contains: q } } },
          ],
        }
          : {}),
      },
      include: {
        division: true,
      },
      orderBy: { creadoEn: "desc" },
    });
  },

  async cveExists(cveProf: string) {
    const found = await prisma.docente.findUnique({
      where: { cveProf },
      select: { id: true },
    });
    return Boolean(found);
  },

  async create(data: DocenteCreateInput, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.docente.create({ data });

      await bitacoraService.log(ctx, {
        tipoMovimiento: TipoMovimientoBitacora.CREAR,
        tablaAfectada: "Docente",
        registroId: created.id,
        descripcion: `Creó nuevo docente ${created.cveProf} - ${created.nombreProf}`,
      }, tx);

      return created;
    });
  },

  async update(cveProf: string, data: any, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.docente.update({
        where: { cveProf },
        data: {
          gradoPrefijo: data.gradoPrefijo,
          nombreProf: data.nombreProf,
          apePatProf: data.apePatProf,
          apeMatProf: data.apeMatProf,
          correoProf: data.correoProf,
          areaConProf: data.areaConProf,
          gradoEspecialidad: data.gradoEspecialidad,
          contratoProf: data.contratoProf,
          cateProf: data.cateProf
        },
      });

        await bitacoraService.log(ctx, {
          tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
          tablaAfectada: "Docente",
          registroId: updated.id,
          descripcion: `Actualizó docente ${updated.cveProf} - ${updated.nombreProf}`,
        }, tx);

      return updated;
    });
  },

  async toggleActivo(id: number, ctx: AuditCtx) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.docente.findUnique({
        where: { id },
        select: { id: true, cveProf: true, activo: true },
      });
      if (!current) throw new Error("Docente no encontrado");

      const updated = await tx.docente.update({
        where: { id },
        data: { activo: !current.activo },
        select: { id: true, cveProf: true, activo: true },
      });

      await bitacoraService.log(ctx, {
        tipoMovimiento: TipoMovimientoBitacora.ACTUALIZAR,
        tablaAfectada: "Docente",
        registroId: updated.id,
        descripcion: `${updated.activo ? "Activó" : "Desactivó"} docente ${updated.cveProf}`,
      }, tx);

      return updated;
    });
  },
};