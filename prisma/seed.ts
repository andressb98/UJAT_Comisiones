import { PrismaClient, PermisoCodigo, RolCodigo } from "@prisma/client";
import bcrypt from "bcryptjs";

// Inicialización estándar para PostgreSQL/Supabase
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
async function hashPassword(pass: string) {
  return bcrypt.hash(pass, SALT_ROUNDS);
}

// --- Catálogos (Basados en tus Enums del schema) ---
const PERMISOS: { codigo: PermisoCodigo; descripcion: string }[] = [
  { codigo: "USUARIOS_VER", descripcion: "Ver usuarios" },
  { codigo: "USUARIOS_CREAR", descripcion: "Crear usuarios" },
  { codigo: "USUARIOS_EDITAR", descripcion: "Editar usuarios" },
  { codigo: "USUARIOS_DESACTIVAR", descripcion: "Desactivar usuarios" },
  { codigo: "ROLES_VER", descripcion: "Ver roles" },
  { codigo: "ROLES_GESTIONAR", descripcion: "Gestionar roles" },
  { codigo: "PERMISOS_VER", descripcion: "Ver permisos" },
  { codigo: "PERMISOS_GESTIONAR", descripcion: "Gestionar permisos" },
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
  { codigo: "DOCENTES_VER", descripcion: "Ver docentes" },
  { codigo: "DOCENTES_CREAR", descripcion: "Crear docentes" },
  { codigo: "DOCENTES_EDITAR", descripcion: "Editar docentes" },
  { codigo: "DOCENTES_DESACTIVAR", descripcion: "Desactivar docentes" },
  { codigo: "CATALOGOS_VER", descripcion: "Ver catálogos" },
  { codigo: "CATALOGOS_GESTIONAR", descripcion: "Gestionar catálogos" },
  { codigo: "COMISIONES_VER", descripcion: "Ver comisiones" },
  { codigo: "COMISIONES_CREAR", descripcion: "Crear comisiones" },
  { codigo: "COMISIONES_EDITAR", descripcion: "Editar comisiones" },
  { codigo: "COMISIONES_CANCELAR", descripcion: "Cancelar comisiones" },
  { codigo: "COMISIONES_CERRAR", descripcion: "Cerrar comisiones" },
  { codigo: "COMISIONES_ASIGNAR_DOCENTES", descripcion: "Asignar docentes a comisiones" },
  { codigo: "COMISIONES_DESASIGNAR_DOCENTES", descripcion: "Desasignar docentes de comisiones" },
  { codigo: "BITACORA_VER", descripcion: "Ver bitácora" },
];

const ROLES: { codigo: RolCodigo; nombre: string; descripcion: string }[] = [
  { codigo: "SUPER_ADMIN", nombre: "Super Admin", descripcion: "Acceso total al sistema" },
  { codigo: "ADMIN_DIVISION", nombre: "Admin de División", descripcion: "Administra una división" },
  { codigo: "SECRETARIA_UNIDAD", nombre: "Secretaria de División", descripcion: "Gestiona tareas administrativas de una división" },
  { codigo: "COORDINADOR_UNIDAD", nombre: "Coordinador de Unidad", descripcion: "Administra una unidad administrativa" },
  { codigo: "SERVICIO_SOCIAL", nombre: "Servicio Social", descripcion: "Rol básico de apoyo" },
];

const PERMISOS_POR_ROL: Record<RolCodigo, PermisoCodigo[]> = {
  SUPER_ADMIN: PERMISOS.map((p) => p.codigo),
  ADMIN_DIVISION: ["USUARIOS_VER", "USUARIOS_CREAR", "USUARIOS_EDITAR", "USUARIOS_DESACTIVAR", "PERMISOS_VER", "PERMISOS_GESTIONAR", "DIVISION_VER", "DIVISION_EDITAR", "UNIDADES_VER", "UNIDADES_CREAR", "UNIDADES_EDITAR", "UNIDADES_DESACTIVAR", "TIPOS_COMISION_VER", "TIPOS_COMISION_CREAR", "TIPOS_COMISION_EDITAR", "TIPOS_COMISION_DESACTIVAR", "LUGARES_VER", "LUGARES_CREAR", "LUGARES_EDITAR", "LUGARES_DESACTIVAR", "DOCENTES_VER", "DOCENTES_CREAR", "DOCENTES_EDITAR", "DOCENTES_DESACTIVAR", "CATALOGOS_VER", "CATALOGOS_GESTIONAR", "COMISIONES_VER", "COMISIONES_CREAR", "COMISIONES_EDITAR", "COMISIONES_CANCELAR", "COMISIONES_CERRAR", "COMISIONES_ASIGNAR_DOCENTES", "COMISIONES_DESASIGNAR_DOCENTES", "BITACORA_VER"],
  COORDINADOR_UNIDAD: ["UNIDADES_VER", "LUGARES_VER", "LUGARES_CREAR", "LUGARES_EDITAR", "LUGARES_DESACTIVAR", "TIPOS_COMISION_VER", "TIPOS_COMISION_CREAR", "TIPOS_COMISION_EDITAR", "DOCENTES_VER", "CATALOGOS_VER", "COMISIONES_VER", "COMISIONES_CREAR", "COMISIONES_EDITAR", "COMISIONES_CANCELAR", "COMISIONES_ASIGNAR_DOCENTES", "COMISIONES_DESASIGNAR_DOCENTES"],
  SECRETARIA_UNIDAD: ["UNIDADES_VER", "LUGARES_VER", "LUGARES_CREAR", "LUGARES_EDITAR", "LUGARES_DESACTIVAR", "TIPOS_COMISION_VER", "TIPOS_COMISION_CREAR", "TIPOS_COMISION_EDITAR", "TIPOS_COMISION_DESACTIVAR", "DOCENTES_VER", "CATALOGOS_VER", "COMISIONES_VER", "COMISIONES_CREAR", "COMISIONES_EDITAR", "COMISIONES_ASIGNAR_DOCENTES", "COMISIONES_DESASIGNAR_DOCENTES"],
  SERVICIO_SOCIAL: ["COMISIONES_VER"],
};

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
    { clave: `${divisionClave}-CG`, siglas: "CG", descripcion: `Coordinación General (${divisionClave})`, divisionId },
    { clave: `${divisionClave}-SE`, siglas: "SE", descripcion: `Servicios Escolares (${divisionClave})`, divisionId },
  ];
}

async function main() {
  console.log("Iniciando seed en Supabase...");

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
      if (!rol) continue;
      const permisosCodigos = PERMISOS_POR_ROL[rolCodigo];
      const permisos = await tx.permiso.findMany({ where: { codigo: { in: permisosCodigos } } });
      for (const p of permisos) {
        await tx.rolPermiso.upsert({
          where: { rolId_permisoId: { rolId: rol.id, permisoId: p.id } },
          update: {},
          create: { rolId: rol.id, permisoId: p.id },
        });
      }
    }

    // 4) Divisiones
    const divisionesCreadas = [];
    for (const d of DIVISIONES) {
      const div = await tx.division.upsert({
        where: { clave: d.siglas },
        update: { siglas: d.siglas, descripcion: d.nombre },
        create: { clave: d.siglas, siglas: d.siglas, descripcion: d.nombre },
      });
      divisionesCreadas.push(div);
    }

    // 5) Unidades
    for (const d of divisionesCreadas) {
      const unidades = unidadesPorDivision(d.clave, d.id);
      for (const u of unidades) {
        await tx.unidadAdministrativa.upsert({
          where: { clave: u.clave },
          update: { siglas: u.siglas, descripcion: u.descripcion },
          create: { clave: u.clave, siglas: u.siglas, descripcion: u.descripcion, divisionId: u.divisionId },
        });
      }
    }

    // 6) Usuario Super Admin (Solo si no existe)
    const superAdminMail = "superadmin@demo.com";
    const existingAdmin = await tx.usuario.findUnique({ where: { correo: superAdminMail } });
    
    if (!existingAdmin) {
      const rolSuper = await tx.rol.findUnique({ where: { codigo: "SUPER_ADMIN" } });
      if (rolSuper) {
        await tx.usuario.create({
          data: {
            nombre: "Super Admin",
            correo: superAdminMail,
            passwordHash: await hashPassword("SuperAdmin123*"),
            activo: true,
            roles: { create: [{ rolId: rolSuper.id }] },
          },
        });
      }
    }
  }, { timeout: 60000 });

  console.log("Seed completado exitosamente.");
}

main()
  .catch((e) => { console.error("Error en el seed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });