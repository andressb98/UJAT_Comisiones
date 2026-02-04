/*
  Warnings:

  - You are about to drop the `SecretariaDivision` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SecretariaDivision";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SecretariaUnidad" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "unidadAdministrativaId" INTEGER NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "SecretariaUnidad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SecretariaUnidad_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SecretariaUnidad_unidadAdministrativaId_fkey" FOREIGN KEY ("unidadAdministrativaId") REFERENCES "UnidadAdministrativa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SecretariaUnidad_usuarioId_key" ON "SecretariaUnidad"("usuarioId");

-- CreateIndex
CREATE INDEX "SecretariaUnidad_divisionId_idx" ON "SecretariaUnidad"("divisionId");
