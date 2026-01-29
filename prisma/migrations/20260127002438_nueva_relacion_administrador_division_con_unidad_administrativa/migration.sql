/*
  Warnings:

  - Added the required column `unidadAdministrativaId` to the `AdministradorDivision` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdministradorDivision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "unidadAdministrativaId" INTEGER NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "AdministradorDivision_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdministradorDivision_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdministradorDivision_unidadAdministrativaId_fkey" FOREIGN KEY ("unidadAdministrativaId") REFERENCES "UnidadAdministrativa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AdministradorDivision" ("actualizadoEn", "creadoEn", "divisionId", "id", "usuarioId") SELECT "actualizadoEn", "creadoEn", "divisionId", "id", "usuarioId" FROM "AdministradorDivision";
DROP TABLE "AdministradorDivision";
ALTER TABLE "new_AdministradorDivision" RENAME TO "AdministradorDivision";
CREATE UNIQUE INDEX "AdministradorDivision_usuarioId_key" ON "AdministradorDivision"("usuarioId");
CREATE INDEX "AdministradorDivision_divisionId_idx" ON "AdministradorDivision"("divisionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
