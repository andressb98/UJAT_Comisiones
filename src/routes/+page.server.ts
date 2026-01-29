import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  // ajusta esto a tu lógica real:
  const user = locals.user ?? null;

  if (!user) throw redirect(303, '/login');
  throw redirect(303, '/dashboard');
};
