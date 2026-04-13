import "dotenv/config";
import { PrismaClient, PermisoCodigo, RolCodigo } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL no está definida en el entorno (.env). Ej: DATABASE_URL="file:./dev.db"');
}

const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

// ----------------------------
// Hash real (DEV/PROD)
// ----------------------------
const SALT_ROUNDS = 10;
async function hashPassword(pass: string) {
  return bcrypt.hash(pass, SALT_ROUNDS);
}

// ----------------------------
// 1) Catálogos base
// ----------------------------
const PERMISOS: { codigo: PermisoCodigo; descripcion: string }[] = [
  // Usuarios / Roles / Permisos
  { codigo: "USUARIOS_VER", descripcion: "Ver usuarios" },
  { codigo: "USUARIOS_CREAR", descripcion: "Crear usuarios" },
  { codigo: "USUARIOS_EDITAR", descripcion: "Editar usuarios" },
  { codigo: "USUARIOS_DESACTIVAR", descripcion: "Desactivar usuarios" },

  { codigo: "ROLES_VER", descripcion: "Ver roles" },
  { codigo: "ROLES_GESTIONAR", descripcion: "Gestionar roles" },

  { codigo: "PERMISOS_VER", descripcion: "Ver permisos" },
  { codigo: "PERMISOS_GESTIONAR", descripcion: "Gestionar permisos" },

  // División / Unidades
  { codigo: "DIVISION_VER", descripcion: "Ver divisiones" },
  { codigo: "DIVISION_EDITAR", descripcion: "Editar divisiones" },

  { codigo: "TIPOS_COMISION_VER", descripcion: "Ver tipos de comisión" },
  { codigo: "TIPOS_COMISION_CREAR", descripcion: "Crear tipos de comisión" },
  { codigo: "TIPOS_COMISION_EDITAR", descripcion: "Editar tipos de comisión" },
  { codigo: "TIPOS_COMISION_DESACTIVAR", descripcion: "Desactivar tipos de comisión" },

  { codigo: "LUGARES_VER", descripcion: "Ver lugares" },
  { codigo: "LUGARES_CREAR", descripcion: "Crear lugares" },
  { codigo: "LUGARES_EDITAR", descripcion: "Editar lugares" },
  { codigo: "LUGARES_DESACTIVAR", descripcion: "Desactivar lugares" },

  { codigo: "UNIDADES_VER", descripcion: "Ver unidades administrativas" },
  { codigo: "UNIDADES_CREAR", descripcion: "Crear unidades administrativas" },
  { codigo: "UNIDADES_EDITAR", descripcion: "Editar unidades administrativas" },
  { codigo: "UNIDADES_DESACTIVAR", descripcion: "Desactivar unidades administrativas" },

  // Docentes
  { codigo: "DOCENTES_VER", descripcion: "Ver docentes" },
  { codigo: "DOCENTES_CREAR", descripcion: "Crear docentes" },
  { codigo: "DOCENTES_EDITAR", descripcion: "Editar docentes" },
  { codigo: "DOCENTES_DESACTIVAR", descripcion: "Desactivar docentes" },

  // Catálogos
  { codigo: "CATALOGOS_VER", descripcion: "Ver catálogos" },
  { codigo: "CATALOGOS_GESTIONAR", descripcion: "Gestionar catálogos" },

  // Comisiones
  { codigo: "COMISIONES_VER", descripcion: "Ver comisiones" },
  { codigo: "COMISIONES_CREAR", descripcion: "Crear comisiones" },
  { codigo: "COMISIONES_EDITAR", descripcion: "Editar comisiones" },
  { codigo: "COMISIONES_CANCELAR", descripcion: "Cancelar comisiones" },
  { codigo: "COMISIONES_CERRAR", descripcion: "Cerrar comisiones" },
  { codigo: "COMISIONES_ASIGNAR_DOCENTES", descripcion: "Asignar docentes a comisiones" },
  { codigo: "COMISIONES_DESASIGNAR_DOCENTES", descripcion: "Desasignar docentes de comisiones" },

  // Bitácora
  { codigo: "BITACORA_VER", descripcion: "Ver bitácora" },
];

const ROLES: { codigo: RolCodigo; nombre: string; descripcion: string }[] = [
  { codigo: "SUPER_ADMIN", nombre: "Super Admin", descripcion: "Acceso total al sistema" },
  { codigo: "ADMIN_DIVISION", nombre: "Admin de División", descripcion: "Administra una división" },
  { codigo: "SECRETARIA_UNIDAD", nombre: "Secretaria de División", descripcion: "Gestiona tareas administrativas de una división" },
  { codigo: "COORDINADOR_UNIDAD", nombre: "Coordinador de Unidad", descripcion: "Administra una unidad administrativa" },
  { codigo: "SERVICIO_SOCIAL", nombre: "Servicio Social", descripcion: "Rol básico de apoyo" },
];

// Mapeo de permisos por rol
const PERMISOS_POR_ROL: Record<RolCodigo, PermisoCodigo[]> = {
  SUPER_ADMIN: PERMISOS.map((p) => p.codigo),

  ADMIN_DIVISION: [
    "USUARIOS_VER", "USUARIOS_CREAR", "USUARIOS_EDITAR", "USUARIOS_DESACTIVAR",
    "PERMISOS_VER", "PERMISOS_GESTIONAR",
    "DIVISION_VER", "DIVISION_EDITAR",
    "UNIDADES_VER", "UNIDADES_CREAR", "UNIDADES_EDITAR", "UNIDADES_DESACTIVAR",
    "TIPOS_COMISION_VER", "TIPOS_COMISION_CREAR", "TIPOS_COMISION_EDITAR", "TIPOS_COMISION_DESACTIVAR",
    "LUGARES_VER", "LUGARES_CREAR", "LUGARES_EDITAR", "LUGARES_DESACTIVAR",
    "DOCENTES_VER", "DOCENTES_CREAR", "DOCENTES_EDITAR", "DOCENTES_DESACTIVAR",
    "CATALOGOS_VER", "CATALOGOS_GESTIONAR",
    "COMISIONES_VER", "COMISIONES_CREAR", "COMISIONES_EDITAR", "COMISIONES_CANCELAR", "COMISIONES_CERRAR",
    "COMISIONES_ASIGNAR_DOCENTES", "COMISIONES_DESASIGNAR_DOCENTES",
    "BITACORA_VER",
  ],

  COORDINADOR_UNIDAD: [
    "UNIDADES_VER",
    "LUGARES_VER", "LUGARES_CREAR", "LUGARES_EDITAR", "LUGARES_DESACTIVAR",
    "TIPOS_COMISION_VER", "TIPOS_COMISION_CREAR", "TIPOS_COMISION_EDITAR",
    "DOCENTES_VER",
    "CATALOGOS_VER",
    "COMISIONES_VER", "COMISIONES_CREAR", "COMISIONES_EDITAR", "COMISIONES_CANCELAR",
    "COMISIONES_ASIGNAR_DOCENTES", "COMISIONES_DESASIGNAR_DOCENTES",
  ],

  SECRETARIA_UNIDAD: [
    "UNIDADES_VER",
    "LUGARES_VER", "LUGARES_CREAR", "LUGARES_EDITAR", "LUGARES_DESACTIVAR",
    "TIPOS_COMISION_VER", "TIPOS_COMISION_CREAR", "TIPOS_COMISION_EDITAR", "TIPOS_COMISION_DESACTIVAR",
    "DOCENTES_VER",
    "CATALOGOS_VER",
    "COMISIONES_VER", "COMISIONES_CREAR", "COMISIONES_EDITAR",
    "COMISIONES_ASIGNAR_DOCENTES", "COMISIONES_DESASIGNAR_DOCENTES",
  ],

  SERVICIO_SOCIAL: [
    "COMISIONES_VER",
  ],
};

// ----------------------------
// 2) Divisiones y unidades
// ----------------------------
const DIVISIONES = [
  { siglas: 'DACAD', nombre: 'División Académica de Ciencias Agropecuarias' },
  { siglas: 'DACB', nombre: 'División Académica de Ciencias Básicas' },
  { siglas: 'DACBiol', nombre: 'División Académica de Ciencias Biológicas' },
  { siglas: 'DACEA', nombre: 'División Académica de Ciencias Económico Administrativas' },
  { siglas: 'DACS', nombre: 'División Académica de Ciencias de la Salud' },
  { siglas: 'DACSyH', nombre: 'División Académica de Ciencias Sociales y Humanidades' },
  { siglas: 'DAEA', nombre: 'División Académica de Educación y Artes' },
  { siglas: 'DAIS', nombre: 'División Académica de Informática y Sistemas' },
  { siglas: 'DAIA', nombre: 'División Académica de Ingeniería y Arquitectura' },
  { siglas: 'DAMC', nombre: 'División Académica Multidisciplinaria de Comalcalco' },
  { siglas: 'DAMJ', nombre: 'División Académica Multidisciplinaria de Jalpa de Méndez' },
  { siglas: 'DAMR', nombre: 'División Académica Multidisciplinaria de los Ríos' },
];


function unidadesPorDivision(divisionClave: string, divisionId: number) {
  return [
    {
      clave: `${divisionClave}-CG`,  // Coordinación General
      siglas: "CG",
      descripcion: `Coordinación General (${divisionClave})`,
      divisionId,
    },
    {
      clave: `${divisionClave}-SE`,  // Servicios Escolares
      siglas: "SE",
      descripcion: `Servicios Escolares (${divisionClave})`,
      divisionId,
    },
  ];
}

// ----------------------------
// 3) Seed principal
// ----------------------------
async function main() {
  console.log("Iniciando seed...");

  // DEV: limpieza total para recrear todo desde cero
  // (hijos -> padres) para no romper FKs
  await prisma.$transaction(async (tx) => {
    await tx.coordinadorUnidad.deleteMany();
    await tx.administradorDivision.deleteMany();
    await tx.secretariaUnidad.deleteMany();
    await tx.usuarioRol.deleteMany();

    await tx.rolPermiso.deleteMany();
    await tx.permiso.deleteMany();
    await tx.rol.deleteMany();

    await tx.unidadAdministrativa.deleteMany();
    await tx.division.deleteMany();

    await tx.usuario.deleteMany();
  });

  // Conteos antes
  const before = {
    permisos: await prisma.permiso.count(),
    roles: await prisma.rol.count(),
    rolPermisos: await prisma.rolPermiso.count(),
    divisiones: await prisma.division.count(),
    unidades: await prisma.unidadAdministrativa.count(),
    usuarios: await prisma.usuario.count(),
    usuarioRoles: await prisma.usuarioRol.count(),
    adminDivision: await prisma.administradorDivision.count(),
    secretariasUnidad: await prisma.secretariaUnidad.count(),
    coordinadores: await prisma.coordinadorUnidad.count(),
  };
  console.log("Conteos antes:", before);

  await prisma.$transaction(async (tx) => {
    // 1) Permisos
    for (const p of PERMISOS) {
      await tx.permiso.upsert({
        where: { codigo: p.codigo },
        update: { descripcion: p.descripcion },
        create: { codigo: p.codigo, descripcion: p.descripcion },
      });
    }

    // 2) Roles
    for (const r of ROLES) {
      await tx.rol.upsert({
        where: { codigo: r.codigo },
        update: { nombre: r.nombre, descripcion: r.descripcion },
        create: { codigo: r.codigo, nombre: r.nombre, descripcion: r.descripcion },
      });
    }

    // 3) RolPermiso
    for (const rolCodigo of Object.keys(PERMISOS_POR_ROL) as RolCodigo[]) {
      const rol = await tx.rol.findUnique({ where: { codigo: rolCodigo } });
      if (!rol) throw new Error(`Rol no encontrado: ${rolCodigo}`);

      const permisosCodigos = PERMISOS_POR_ROL[rolCodigo];
      const permisos = await tx.permiso.findMany({
        where: { codigo: { in: permisosCodigos } },
        select: { id: true, codigo: true },
      });

      const encontrados = new Set(permisos.map((p) => p.codigo));
      const faltantes = permisosCodigos.filter((c) => !encontrados.has(c));
      if (faltantes.length) throw new Error(`Permisos faltantes para ${rolCodigo}: ${faltantes.join(", ")}`);

      for (const p of permisos) {
        await tx.rolPermiso.upsert({
          where: { rolId_permisoId: { rolId: rol.id, permisoId: p.id } },
          update: {},
          create: { rolId: rol.id, permisoId: p.id },
        });
      }
    }

    // 4) Divisiones
    const divisionesCreadas: { id: number; clave: string; siglas: string }[] = [];
    for (const d of DIVISIONES) {
      const div = await tx.division.upsert({
        where: { clave: d.siglas },
        update: { siglas: d.siglas, descripcion: d.nombre },
        create: { clave: d.siglas, siglas: d.siglas, descripcion: d.nombre },
        select: { id: true, clave: true, siglas: true },
      });
      divisionesCreadas.push(div);
    }

    // 5) Unidades administrativas (2 por división: "Coordinación General" y "Servicios Escolares")
    const unidadesCreadas: { id: number; divisionId: number; clave: string }[] = [];
    for (const d of divisionesCreadas) {
      const unidades = unidadesPorDivision(d.clave, d.id); // Crea exactamente dos unidades
      for (const u of unidades) {
        const ua = await tx.unidadAdministrativa.upsert({
          where: { clave_divisionId: { clave: u.clave, divisionId: u.divisionId } },
          update: { siglas: u.siglas, descripcion: u.descripcion },
          create: { clave: u.clave, siglas: u.siglas, descripcion: u.descripcion, divisionId: u.divisionId },
          select: { id: true, divisionId: true, clave: true },
        });
        unidadesCreadas.push(ua);
      }
    }

    // Helper: roles por código
    const rolSuper = await tx.rol.findUnique({ where: { codigo: "SUPER_ADMIN" }, select: { id: true } });
    const rolAdminDiv = await tx.rol.findUnique({ where: { codigo: "ADMIN_DIVISION" }, select: { id: true } });
    const rolSecretariaUnidad = await tx.rol.findUnique({ where: { codigo: "SECRETARIA_UNIDAD" }, select: { id: true } });
    const rolCoord = await tx.rol.findUnique({ where: { codigo: "COORDINADOR_UNIDAD" }, select: { id: true } });
    if (!rolSuper || !rolAdminDiv || !rolSecretariaUnidad || !rolCoord) throw new Error("Faltan roles base");

    // 6) Usuarios + UsuarioRol + perfiles (AdministradorDivision / CoordinadorUnidad)

    // 6.1 Super admin
    const superAdminPass = "SuperAdmin123*";
    const superAdmin = await tx.usuario.create({
      data: {
        nombre: "Super Admin",
        correo: "superadmin@demo.com",
        passwordHash: await hashPassword(superAdminPass),
        activo: true,
        roles: {
          create: [{ rolId: rolSuper.id }],
        },
      },
      select: { id: true, correo: true },
    });

    // 6.2 Admin por división (5)
    const adminPass = "AdminDivision123*";
    for (const d of divisionesCreadas) {
      const correo = `admin.${d.clave.toLowerCase()}@demo.com`;

      // Seleccionamos las unidades administrativas creadas para esta división
      const unidadesDeDivision = await tx.unidadAdministrativa.findMany({
        where: { divisionId: d.id },
      });

      // Asumimos que estamos utilizando la unidad "Coordinación General" para el administrador
      const unidadAdministrativa = unidadesDeDivision.find(u => u.siglas === "CG");

      if (!unidadAdministrativa) {
        throw new Error(`No se encontró la unidad administrativa 'Coordinación General' para la división ${d.clave}`);
      }

      // Crear el administrador de la división con la relación a la unidad administrativa
      const admin = await tx.usuario.create({
        data: {
          nombre: `Admin ${d.siglas}`,
          correo,
          passwordHash: await hashPassword(adminPass),
          activo: true,
          roles: {
            create: [{ rolId: rolAdminDiv.id }],
          },
          adminDivision: {
            create: {
              divisionId: d.id,
              unidadAdministrativaId: unidadAdministrativa.id, // Relación con la unidad administrativa
            },
          },
        },
        select: { id: true },
      });

      void admin;
    }

    // 6.3 Secretaria por unidad (5)
    const secretariaPass = "SecretariaUnidad123*";
    for (const d of divisionesCreadas) {
      const correo = `secretaria.${d.clave.toLowerCase()}@demo.com`;

      // Seleccionamos las unidades administrativas creadas para esta división
      const unidadesDeDivision = await tx.unidadAdministrativa.findMany({
        where: { divisionId: d.id },
      });

      // Cambiar "CG" a "SE" para la unidad "Servicios Escolares"
      const unidadAdministrativa = unidadesDeDivision.find(u => u.siglas === "CG");

      if (!unidadAdministrativa) {
        throw new Error(`No se encontró la unidad administrativa 'Servicios Escolares' para la división ${d.clave}`);
      }

      // Crear la secretaria de la división con la relación a la unidad administrativa
      const secretaria = await tx.usuario.create({
        data: {
          nombre: `Secretaria ${d.siglas}`,
          correo,
          passwordHash: await hashPassword(secretariaPass),
          activo: true,
          roles: {
            create: [{ rolId: rolSecretariaUnidad.id }],
          },
          secretaria: {
            create: {
              divisionId: d.id,
              unidadAdministrativaId: unidadAdministrativa.id, // Relación con la unidad administrativa
            },
          },
        },
        select: { id: true },
      });

      void secretaria;
    }


    // 6.3 Coordinador por unidad (25)
    const coordPass = "CoordUnidad123*";
    for (const u of unidadesCreadas) {
      const correo = `coord.${u.clave.toLowerCase()}@demo.com`;

      await tx.usuario.create({
        data: {
          nombre: `Coordinador ${u.clave}`,
          correo,
          passwordHash: await hashPassword(coordPass),
          activo: true,
          roles: {
            create: [{ rolId: rolCoord.id }],
          },
          coordinador: {
            create: { unidadId: u.id },
          },
        },
      });
    }

    void superAdmin;
  }, {
    timeout: 30000
  });

  // Conteos después
  const after = {
    permisos: await prisma.permiso.count(),
    roles: await prisma.rol.count(),
    rolPermisos: await prisma.rolPermiso.count(),
    divisiones: await prisma.division.count(),
    unidades: await prisma.unidadAdministrativa.count(),
    usuarios: await prisma.usuario.count(),
    usuarioRoles: await prisma.usuarioRol.count(),
    adminDivision: await prisma.administradorDivision.count(),
    secretariasUnidad: await prisma.secretariaUnidad.count(),
    coordinadores: await prisma.coordinadorUnidad.count(),
  };
  console.log("Conteos después:", after);

  console.log("Seed completado");
  console.log("Credenciales demo:");
  console.log("   superadmin@demo.com / SuperAdmin123*");
  console.log("   admin.d01@demo.com / AdminDivision123* (y así D02..D05)");
  console.log("   coord.d01-ua1@demo.com / CoordUnidad123* (y así para cada unidad)");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
