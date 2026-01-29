-- CreateTable
CREATE TABLE "SecretariaDivision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "unidadAdministrativaId" INTEGER NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "SecretariaDivision_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SecretariaDivision_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SecretariaDivision_unidadAdministrativaId_fkey" FOREIGN KEY ("unidadAdministrativaId") REFERENCES "UnidadAdministrativa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SecretariaDivision_usuarioId_key" ON "SecretariaDivision"("usuarioId");

-- CreateIndex
CREATE INDEX "SecretariaDivision_divisionId_idx" ON "SecretariaDivision"("divisionId");
