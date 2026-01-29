/*
  Warnings:

  - Added the required column `divisionId` to the `Comision` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "claveComision" TEXT NOT NULL,
    "tipoComisionId" INTEGER NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME,
    "horaInicio" TEXT,
    "horaFin" TEXT,
    "frecuenciaRepeticion" TEXT,
    "referencia" TEXT,
    "creadorId" INTEGER,
    "unidadAdministrativaId" INTEGER NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "estatus" TEXT NOT NULL DEFAULT 'ACTIVA',
    "canceladaEn" DATETIME,
    "canceladaPorId" INTEGER,
    "cerradaEn" DATETIME,
    "cerradaPorId" INTEGER,
    "observaciones" TEXT,
    "lugarId" INTEGER,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Comision_tipoComisionId_fkey" FOREIGN KEY ("tipoComisionId") REFERENCES "TipoComision" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comision_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comision_unidadAdministrativaId_fkey" FOREIGN KEY ("unidadAdministrativaId") REFERENCES "UnidadAdministrativa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comision_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comision_canceladaPorId_fkey" FOREIGN KEY ("canceladaPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comision_cerradaPorId_fkey" FOREIGN KEY ("cerradaPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comision_lugarId_fkey" FOREIGN KEY ("lugarId") REFERENCES "Lugar" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comision" ("actualizadoEn", "canceladaEn", "canceladaPorId", "cerradaEn", "cerradaPorId", "claveComision", "creadoEn", "creadorId", "estatus", "fechaFin", "fechaInicio", "frecuenciaRepeticion", "horaFin", "horaInicio", "id", "lugarId", "observaciones", "referencia", "tipoComisionId", "unidadAdministrativaId") SELECT "actualizadoEn", "canceladaEn", "canceladaPorId", "cerradaEn", "cerradaPorId", "claveComision", "creadoEn", "creadorId", "estatus", "fechaFin", "fechaInicio", "frecuenciaRepeticion", "horaFin", "horaInicio", "id", "lugarId", "observaciones", "referencia", "tipoComisionId", "unidadAdministrativaId" FROM "Comision";
DROP TABLE "Comision";
ALTER TABLE "new_Comision" RENAME TO "Comision";
CREATE UNIQUE INDEX "Comision_claveComision_key" ON "Comision"("claveComision");
CREATE INDEX "Comision_tipoComisionId_idx" ON "Comision"("tipoComisionId");
CREATE INDEX "Comision_creadorId_idx" ON "Comision"("creadorId");
CREATE INDEX "Comision_unidadAdministrativaId_idx" ON "Comision"("unidadAdministrativaId");
CREATE INDEX "Comision_divisionId_idx" ON "Comision"("divisionId");
CREATE INDEX "Comision_estatus_idx" ON "Comision"("estatus");
CREATE INDEX "Comision_canceladaPorId_idx" ON "Comision"("canceladaPorId");
CREATE INDEX "Comision_cerradaPorId_idx" ON "Comision"("cerradaPorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
