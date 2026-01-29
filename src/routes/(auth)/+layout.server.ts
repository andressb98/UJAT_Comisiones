import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (locals.user) {
    const next = url.searchParams.get('next');
    throw redirect(303, next || '/dashboard');
  }
  return {};
};
