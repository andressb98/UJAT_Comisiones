/*
  Warnings:

  - You are about to drop the column `gradoProf` on the `Docente` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `GradosProfesor` table. All the data in the column will be lost.
  - Added the required column `actualizadoEn` to the `GradosProfesor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clave` to the `GradosProfesor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `GradosProfesor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `GradosProfesor` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Docente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cveProf" TEXT NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "areaConProf" TEXT,
    "gradoProfId" INTEGER,
    "gradoCompletoId" INTEGER,
    "nombreProf" TEXT NOT NULL,
    "apePatProf" TEXT NOT NULL,
    "apeMatProf" TEXT,
    "contratoProf" TEXT,
    "cateProf" TEXT,
    "correoProf" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Docente_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Docente_gradoProfId_fkey" FOREIGN KEY ("gradoProfId") REFERENCES "GradosProfesor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Docente_gradoCompletoId_fkey" FOREIGN KEY ("gradoCompletoId") REFERENCES "GradosProfesor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Docente" ("activo", "actualizadoEn", "apeMatProf", "apePatProf", "areaConProf", "cateProf", "contratoProf", "correoProf", "creadoEn", "cveProf", "divisionId", "gradoCompletoId", "id", "nombreProf") SELECT "activo", "actualizadoEn", "apeMatProf", "apePatProf", "areaConProf", "cateProf", "contratoProf", "correoProf", "creadoEn", "cveProf", "divisionId", "gradoCompletoId", "id", "nombreProf" FROM "Docente";
DROP TABLE "Docente";
ALTER TABLE "new_Docente" RENAME TO "Docente";
CREATE UNIQUE INDEX "Docente_cveProf_key" ON "Docente"("cveProf");
CREATE INDEX "Docente_divisionId_idx" ON "Docente"("divisionId");
CREATE INDEX "Docente_activo_idx" ON "Docente"("activo");
CREATE TABLE "new_GradosProfesor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);
INSERT INTO "new_GradosProfesor" ("id") SELECT "id" FROM "GradosProfesor";
DROP TABLE "GradosProfesor";
ALTER TABLE "new_GradosProfesor" RENAME TO "GradosProfesor";
CREATE UNIQUE INDEX "GradosProfesor_clave_key" ON "GradosProfesor"("clave");
CREATE INDEX "GradosProfesor_tipo_idx" ON "GradosProfesor"("tipo");
CREATE INDEX "GradosProfesor_activo_idx" ON "GradosProfesor"("activo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
