/*
  Warnings:

  - A unique constraint covering the columns `[clave]` on the table `UnidadAdministrativa` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UnidadAdministrativa_clave_key" ON "UnidadAdministrativa"("clave");
