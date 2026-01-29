import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearSessionCookie, deleteSessionByToken } from '$lib/server/auth/auth.service';

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get('session');
  if (token) await deleteSessionByToken(token);
  clearSessionCookie(cookies);
  throw redirect(303, '/login');
};
    