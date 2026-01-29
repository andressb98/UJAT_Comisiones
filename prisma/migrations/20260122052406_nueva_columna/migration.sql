-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TipoComision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "alcance" TEXT,
    "departamentoCreador" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);
INSERT INTO "new_TipoComision" ("actualizadoEn", "alcance", "clave", "creadoEn", "departamentoCreador", "descripcion", "id", "nombre") SELECT "actualizadoEn", "alcance", "clave", "creadoEn", "departamentoCreador", "descripcion", "id", "nombre" FROM "TipoComision";
DROP TABLE "TipoComision";
ALTER TABLE "new_TipoComision" RENAME TO "TipoComision";
CREATE UNIQUE INDEX "TipoComision_nombre_key" ON "TipoComision"("nombre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
