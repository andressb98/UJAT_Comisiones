<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from '../$types';

  export let form: ActionData;
</script>

<section class="hero is-fullheight">
  <div class="hero-body">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-12-mobile is-8-tablet is-5-desktop">
          <div class="box">
            <h1 class="title has-text-centered">Iniciar Sesión</h1>

            {#if form?.message}
              <p class="notification is-danger is-light">{form.message}</p>
            {/if}

            <form method="POST" use:enhance>
              <div class="field">
                <label class="label">Email</label>
                <div class="control has-icons-left">
                  <input
                    class="input"
                    name="correo"
                    type="email"
                    placeholder="tu@email.com"
                    autocomplete="email"
                    value={form?.values?.correo ?? ''}
                    required
                  />
                  <span class="icon is-small is-left" aria-hidden="true">✉️</span>
                </div>
              </div>

              <div class="field">
                <label class="label">Contraseña</label>
                <div class="control has-icons-left">
                  <input
                    class="input"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    required
                  />
                  <span class="icon is-small is-left" aria-hidden="true">🔒</span>
                </div>
              </div>

              <div class="field mt-5">
                <button class="button is-primary is-fullwidth" type="submit">
                  Iniciar sesión
                </button>
              </div>

              <p class="has-text-centered mt-4 has-text-grey">
                Demo: usa <b>demo@demo.com</b> / <b>123456</b>
              </p>
            </form>
          </div>

          <p class="has-text-centered mt-4 has-text-grey-light">
            v0.1 • AsistenciaWeb
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
