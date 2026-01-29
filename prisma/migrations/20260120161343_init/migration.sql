-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UsuarioRol" (
    "usuarioId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,
    "asignadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("usuarioId", "rolId"),
    CONSTRAINT "UsuarioRol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsuarioRol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RolPermiso" (
    "rolId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("rolId", "permisoId"),
    CONSTRAINT "RolPermiso_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RolPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Division" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clave" TEXT NOT NULL,
    "siglas" TEXT NOT NULL,
    "descripcion" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UnidadAdministrativa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clave" TEXT NOT NULL,
    "siglas" TEXT NOT NULL,
    "descripcion" TEXT,
    "divisionId" INTEGER NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "UnidadAdministrativa_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdministradorDivision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "AdministradorDivision_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdministradorDivision_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoordinadorUnidad" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "unidadId" INTEGER NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "CoordinadorUnidad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CoordinadorUnidad_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "UnidadAdministrativa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Docente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cveProf" TEXT NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "areaConProf" TEXT,
    "gradoProf" TEXT,
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
    CONSTRAINT "Docente_gradoCompletoId_fkey" FOREIGN KEY ("gradoCompletoId") REFERENCES "GradosProfesor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GradosProfesor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TipoComision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "alcance" TEXT,
    "departamentoCreador" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Comision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "claveComision" TEXT NOT NULL,
    "tipoComisionId" INTEGER NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME,
    "horaInicio" TEXT,
    "horaFin" TEXT,
    "frecuenciaRepeticion" TEXT,
    "referencia" TEXT,
    "creadorId" INTEGER,
    "unidadAdministrativaId" INTEGER NOT NULL,
    "estatus" TEXT NOT NULL DEFAULT 'ACTIVA',
    "canceladaEn" DATETIME,
    "canceladaPorId" INTEGER,
    "cerradaEn" DATETIME,
    "cerradaPorId" INTEGER,
    "observaciones" TEXT,
    "lugarId" INTEGER,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Comision_tipoComisionId_fkey" FOREIGN KEY ("tipoComisionId") REFERENCES "TipoComision" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comision_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comision_unidadAdministrativaId_fkey" FOREIGN KEY ("unidadAdministrativaId") REFERENCES "UnidadAdministrativa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comision_canceladaPorId_fkey" FOREIGN KEY ("canceladaPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comision_cerradaPorId_fkey" FOREIGN KEY ("cerradaPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comision_lugarId_fkey" FOREIGN KEY ("lugarId") REFERENCES "Lugar" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocenteComision" (
    "docenteId" INTEGER NOT NULL,
    "comisionId" INTEGER NOT NULL,
    "fechaAsignacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("docenteId", "comisionId"),
    CONSTRAINT "DocenteComision_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DocenteComision_comisionId_fkey" FOREIGN KEY ("comisionId") REFERENCES "Comision" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lugar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clave" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoUbicacion" TEXT,
    "edificio" TEXT,
    "salonOficinaAula" TEXT,
    "municipioCiudad" TEXT,
    "coloniaBarrio" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Bitacora" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "fechaHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoMovimiento" TEXT NOT NULL,
    "tablaAfectada" TEXT,
    "registroId" INTEGER,
    "descripcion" TEXT,
    "ipOrigen" TEXT,
    CONSTRAINT "Bitacora_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "Usuario_activo_idx" ON "Usuario"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_codigo_key" ON "Rol"("codigo");

-- CreateIndex
CREATE INDEX "UsuarioRol_rolId_idx" ON "UsuarioRol"("rolId");

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_codigo_key" ON "Permiso"("codigo");

-- CreateIndex
CREATE INDEX "RolPermiso_permisoId_idx" ON "RolPermiso"("permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "Division_clave_key" ON "Division"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "Division_siglas_key" ON "Division"("siglas");

-- CreateIndex
CREATE INDEX "UnidadAdministrativa_divisionId_idx" ON "UnidadAdministrativa"("divisionId");

-- CreateIndex
CREATE UNIQUE INDEX "UnidadAdministrativa_clave_divisionId_key" ON "UnidadAdministrativa"("clave", "divisionId");

-- CreateIndex
CREATE UNIQUE INDEX "UnidadAdministrativa_siglas_divisionId_key" ON "UnidadAdministrativa"("siglas", "divisionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdministradorDivision_usuarioId_key" ON "AdministradorDivision"("usuarioId");

-- CreateIndex
CREATE INDEX "AdministradorDivision_divisionId_idx" ON "AdministradorDivision"("divisionId");

-- CreateIndex
CREATE UNIQUE INDEX "CoordinadorUnidad_usuarioId_key" ON "CoordinadorUnidad"("usuarioId");

-- CreateIndex
CREATE INDEX "CoordinadorUnidad_unidadId_idx" ON "CoordinadorUnidad"("unidadId");

-- CreateIndex
CREATE UNIQUE INDEX "Docente_cveProf_key" ON "Docente"("cveProf");

-- CreateIndex
CREATE INDEX "Docente_divisionId_idx" ON "Docente"("divisionId");

-- CreateIndex
CREATE INDEX "Docente_activo_idx" ON "Docente"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "GradosProfesor_descripcion_key" ON "GradosProfesor"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "TipoComision_nombre_key" ON "TipoComision"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Comision_claveComision_key" ON "Comision"("claveComision");

-- CreateIndex
CREATE INDEX "Comision_tipoComisionId_idx" ON "Comision"("tipoComisionId");

-- CreateIndex
CREATE INDEX "Comision_creadorId_idx" ON "Comision"("creadorId");

-- CreateIndex
CREATE INDEX "Comision_unidadAdministrativaId_idx" ON "Comision"("unidadAdministrativaId");

-- CreateIndex
CREATE INDEX "Comision_estatus_idx" ON "Comision"("estatus");

-- CreateIndex
CREATE INDEX "Comision_canceladaPorId_idx" ON "Comision"("canceladaPorId");

-- CreateIndex
CREATE INDEX "Comision_cerradaPorId_idx" ON "Comision"("cerradaPorId");

-- CreateIndex
CREATE INDEX "DocenteComision_comisionId_idx" ON "DocenteComision"("comisionId");

-- CreateIndex
CREATE UNIQUE INDEX "Lugar_clave_key" ON "Lugar"("clave");
