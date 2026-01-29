<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { enhance } from "$app/forms";

  export let open = false;

  const dispatch = createEventDispatcher<{
    close: void;
    created: { division: { id: number; clave: string; siglas: string; descripcion: string | null } };
  }>();

  let siglas = "";
  let descripcion = "";

  function close() {
    open = false;
    dispatch("close");
  }

  function reset() {
    siglas = "";
    descripcion = "";
  }
</script>

{#if open}
  <div class="modal is-active">
    <div class="modal-background" on:click={close}></div>

    <div class="modal-card" style="width: 560px; max-width: 95vw;">
      <header class="modal-card-head">
        <p class="modal-card-title">Crear división rápida</p>
        <button class="delete" aria-label="close" on:click={close}></button>
      </header>

      <section class="modal-card-body">
        <form
          method="POST"
          action="?/createDivisionQuick"
          use:enhance={() => {
            return async ({ result }) => {
              // @ts-ignore
              if (result?.type === "success") {
                // @ts-ignore
                const payload = result.data;
                if (payload?.division) {
                  dispatch("created", { division: payload.division });
                  reset();
                  close();
                }
              }
            };
          }}
        >
          <div class="field">
            <label class="label">Siglas</label>
            <div class="control">
              <input class="input" name="siglas" bind:value={siglas} placeholder="Ej: DACEA" required />
            </div>
            <p class="help">La clave se genera automáticamente.</p>
          </div>

          <div class="field">
            <label class="label">Descripción (opcional)</label>
            <div class="control">
              <input class="input" name="descripcion" bind:value={descripcion} placeholder="Ej: División Académica..." />
            </div>
          </div>

          <div class="is-flex is-justify-content-flex-end gap-2" style="margin-top: 1rem;">
            <button class="button is-primary" type="submit">Crear</button>
            <button class="button is-light" type="button" on:click={close}>Cancelar</button>
          </div>
        </form>
      </section>
    </div>
  </div>
{/if}
