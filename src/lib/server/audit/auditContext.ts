import type { RequestEvent } from "@sveltejs/kit";

export function getAuditCtx(event: RequestEvent) {
  // Ajusta esto a como guardas al usuario en locals (ej: event.locals.auth.user)
  const userId = event.locals?.user?.id ?? event.locals?.user?.id;
  const divisionId = event.locals?.division?.id ?? null;
  const divId = event.locals?.unidad?.id ?? null;

  if (!userId) return null;

  const ip = event.getClientAddress?.() ?? null;

  return { usuarioId: userId, ipOrigen: ip, unidadAdministrativaId: divId, divisionId: divisionId };
}
