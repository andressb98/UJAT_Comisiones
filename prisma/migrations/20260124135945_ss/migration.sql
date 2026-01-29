/*
  Warnings:

  - You are about to drop the `GradosProfesor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `gradoCompletoId` on the `Docente` table. All the data in the column will be lost.
  - You are about to drop the column `gradoProfId` on the `Docente` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "GradosProfesor_activo_idx";

-- DropIndex
DROP INDEX "GradosProfesor_nivel_idx";

-- DropIndex
DROP INDEX "GradosProfesor_categoria_idx";

-- DropIndex
DROP INDEX "GradosProfesor_clave_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GradosProfesor";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Docente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cveProf" TEXT NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "areaConProf" TEXT,
    "gradoPrefijo" TEXT,
    "gradoEspecialidad" TEXT,
    "nombreProf" TEXT NOT NULL,
    "apePatProf" TEXT NOT NULL,
    "apeMatProf" TEXT,
    "contratoProf" TEXT,
    "cateProf" TEXT,
    "correoProf" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Docente_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Docente" ("activo", "actualizadoEn", "apeMatProf", "apePatProf", "areaConProf", "cateProf", "contratoProf", "correoProf", "creadoEn", "cveProf", "divisionId", "id", "nombreProf") SELECT "activo", "actualizadoEn", "apeMatProf", "apePatProf", "areaConProf", "cateProf", "contratoProf", "correoProf", "creadoEn", "cveProf", "divisionId", "id", "nombreProf" FROM "Docente";
DROP TABLE "Docente";
ALTER TABLE "new_Docente" RENAME TO "Docente";
CREATE UNIQUE INDEX "Docente_cveProf_key" ON "Docente"("cveProf");
CREATE INDEX "Docente_divisionId_idx" ON "Docente"("divisionId");
CREATE INDEX "Docente_activo_idx" ON "Docente"("activo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
