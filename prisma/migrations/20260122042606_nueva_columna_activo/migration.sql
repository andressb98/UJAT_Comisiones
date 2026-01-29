-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lugar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clave" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoUbicacion" TEXT,
    "edificio" TEXT,
    "salonOficinaAula" TEXT,
    "municipioCiudad" TEXT,
    "coloniaBarrio" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);
INSERT INTO "new_Lugar" ("actualizadoEn", "clave", "coloniaBarrio", "creadoEn", "descripcion", "edificio", "id", "municipioCiudad", "salonOficinaAula", "tipoUbicacion") SELECT "actualizadoEn", "clave", "coloniaBarrio", "creadoEn", "descripcion", "edificio", "id", "municipioCiudad", "salonOficinaAula", "tipoUbicacion" FROM "Lugar";
DROP TABLE "Lugar";
ALTER TABLE "new_Lugar" RENAME TO "Lugar";
CREATE UNIQUE INDEX "Lugar_clave_key" ON "Lugar"("clave");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
