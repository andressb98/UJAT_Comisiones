import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { loginSchema } from '$lib/server/auth/auth.schema';
import { createSession, loginWithEmailPassword, setSessionCookie } from '$lib/server/auth/auth.service';

function getString(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) {
    const next = url.searchParams.get('next');
    throw redirect(303, next || '/dashboard');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const form = await request.formData();
    const raw = {
      correo: getString(form, 'correo'),
      password: getString(form, 'password')
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        message: parsed.error.issues[0]?.message ?? 'Datos inválidos',
        values: { correo: raw.correo }
      });
    }

    const { correo, password } = parsed.data;

    const user = await loginWithEmailPassword(correo, password);
    if (!user) {
      return fail(401, { message: 'Credenciales incorrectas.', values: { correo } });
    }

    const { token, expiraEn } = await createSession(user.id);
    setSessionCookie(cookies, token, expiraEn);

    const next = url.searchParams.get('next');
    throw redirect(303, next || '/dashboard');
  }
};
