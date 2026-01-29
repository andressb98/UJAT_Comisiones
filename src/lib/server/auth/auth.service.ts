import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { Cookies } from '@sveltejs/kit';
import type { PermisoCodigo, RolCodigo } from '@prisma/client';
import { prisma } from '$lib/server/prisma';

const SESSION_COOKIE = 'session';
const SESSION_DAYS = 1;

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}
function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

export type SafeUser = { id: number; nombre: string; correo: string };

export async function loginWithEmailPassword(correo: string, password: string) {
  const user = await prisma.usuario.findUnique({
    where: { correo },
    select: { id: true, nombre: true, correo: true, passwordHash: true, activo: true }
  });

  if (!user || !user.activo) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return { id: user.id, nombre: user.nombre, correo: user.correo } satisfies SafeUser;
}

export async function createSession(usuarioId: number) {
  const token = newToken();
  const tokenHash = sha256(token);

  const expiraEn = new Date();
  expiraEn.setDate(expiraEn.getDate() + SESSION_DAYS);

  await prisma.sesion.create({
    data: { usuarioId, tokenHash, expiraEn }
  });

  return { token, expiraEn };
}

export function setSessionCookie(cookies: Cookies, token: string, expiraEn: Date) {
  cookies.set(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiraEn
  });
}

export async function deleteSessionByToken(token: string) {
  const tokenHash = sha256(token);
  await prisma.sesion.deleteMany({ where: { tokenHash } });
}

export function clearSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

/**
 * ✅ Carga contexto de autenticación: Usuario + Roles + Permisos + División + Unidad
 */
export async function getAuthContextFromRequest(cookies: Cookies) {
  const token = cookies.get(SESSION_COOKIE);
  if (!token) return null;

  const tokenHash = sha256(token);

  const session = await prisma.sesion.findUnique({
    where: { tokenHash },
    select: {
      expiraEn: true,
      usuario: {
        select: {
          id: true,
          nombre: true,
          correo: true,
          activo: true,

          // Roles y Permisos
          roles: {
            select: {
              rol: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  permisos: { select: { permiso: { select: { codigo: true } } } }
                }
              }
            }
          },

          // Perfil: Administrador de División
          adminDivision: {
            select: {
              division: { select: { id: true, descripcion: true } },
              unidadAdministrativa: { select: { id: true, descripcion: true } }
            }
          },

          // Perfil: Secretaria de División
          secretaria: {
            select: {
              division: { select: { id: true, descripcion: true } },
              unidadAdministrativa: { select: { id: true, descripcion: true } }
            }
          },

          // Perfil: Coordinador de Unidad
          coordinador: {
            select: {
              unidad: {
                select: {
                  id: true,
                  descripcion: true,
                  division: { select: { id: true, descripcion: true } }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!session) return null;

  // Manejo de sesión expirada
  if (session.expiraEn <= new Date()) {
    await prisma.sesion.deleteMany({ where: { tokenHash } });
    return null;
  }

  const u = session.usuario;
  if (!u || !u.activo) return null;

  // 1. Mapear Roles
  const roles = u.roles.map((ur) => ({
    id: ur.rol.id,
    codigo: ur.rol.codigo,
    nombre: ur.rol.nombre
  })) as { id: number; codigo: RolCodigo; nombre: string }[];

  // 2. Mapear Permisos Únicos
  const permisosSet = new Set<PermisoCodigo>();
  for (const ur of u.roles) {
    for (const rp of ur.rol.permisos) {
      permisosSet.add(rp.permiso.codigo);
    }
  }

  // 3. Extraer Unidad y División (Lógica Multiperfil)
  
  // Obtenemos el objeto de unidad crudo de cualquiera de los perfiles disponibles
  const rawUnidad = 
    u.coordinador?.unidad || 
    u.secretaria?.unidadAdministrativa || 
    u.adminDivision?.unidadAdministrativa;

  // Obtenemos el objeto de división crudo de la unidad o de los perfiles directos
  const rawDivision = 
    rawUnidad?.division || 
    u.adminDivision?.division || 
    u.secretaria?.division;

  const unidad = rawUnidad 
    ? { id: rawUnidad.id, nombre: rawUnidad.descripcion ?? 'Sin descripción' } 
    : null;

  const division = rawDivision 
    ? { id: rawDivision.id, descripcion: rawDivision.descripcion ?? 'Sin descripción' } 
    : null;

  return {
    user: { id: u.id, nombre: u.nombre, correo: u.correo } satisfies SafeUser,
    roles,
    permisos: Array.from(permisosSet),
    division,
    unidad
  };
}