/*
  Warnings:

  - A unique constraint covering the columns `[clave]` on the table `TipoComision` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TipoComision_clave_key" ON "TipoComision"("clave");
