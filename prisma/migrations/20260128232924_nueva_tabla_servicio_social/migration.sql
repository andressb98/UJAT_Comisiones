-- CreateTable
CREATE TABLE "UsuarioServicioSocial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "unidadAdministrativaId" INTEGER NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "UsuarioServicioSocial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsuarioServicioSocial_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsuarioServicioSocial_unidadAdministrativaId_fkey" FOREIGN KEY ("unidadAdministrativaId") REFERENCES "UnidadAdministrativa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UsuarioServicioSocial_divisionId_idx" ON "UsuarioServicioSocial"("divisionId");

-- CreateIndex
CREATE INDEX "UsuarioServicioSocial_unidadAdministrativaId_idx" ON "UsuarioServicioSocial"("unidadAdministrativaId");
