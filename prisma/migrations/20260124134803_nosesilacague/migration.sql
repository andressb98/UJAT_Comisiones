/*
  Warnings:

  - You are about to drop the column `tipo` on the `GradosProfesor` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GradosProfesor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoria" TEXT NOT NULL DEFAULT 'CORTO',
    "nivel" TEXT,
    "clave" TEXT NOT NULL,
    "abreviatura" TEXT,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);
INSERT INTO "new_GradosProfesor" ("activo", "actualizadoEn", "clave", "creadoEn", "id", "nombre") SELECT "activo", "actualizadoEn", "clave", "creadoEn", "id", "nombre" FROM "GradosProfesor";
DROP TABLE "GradosProfesor";
ALTER TABLE "new_GradosProfesor" RENAME TO "GradosProfesor";
CREATE UNIQUE INDEX "GradosProfesor_clave_key" ON "GradosProfesor"("clave");
CREATE INDEX "GradosProfesor_categoria_idx" ON "GradosProfesor"("categoria");
CREATE INDEX "GradosProfesor_nivel_idx" ON "GradosProfesor"("nivel");
CREATE INDEX "GradosProfesor_activo_idx" ON "GradosProfesor"("activo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
