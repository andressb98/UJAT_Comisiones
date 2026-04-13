<script lang="ts">
    import FormAlert from '$lib/components/forms/FormAlert.svelte';
    import { createEventDispatcher } from 'svelte';
    import { enhance } from '$app/forms';
    import { hasFieldError, firstFieldError } from '$lib/utils/forms/field';

    const dispatch = createEventDispatcher();

    // Props que recibimos del padre
    export let mode: 'create' | 'edit';
    export let formData: {
        id: number | null;
        nombre: string;
        descripcion: string;
    };
    export let formMessage: string | null;
    export let formErrors: string[];
    export let fieldErrors: Record<string, string[] | undefined>;
    export let submitHandler: any;
</script>

<div class="box" style="margin-top: 1rem;">
    <div class="level">
        <div class="level-left">
            <h2 class="title is-5">
                {mode === 'create' ? 'Agregar tipo de comisión' : 'Editar tipo de comisión'}
            </h2>
        </div>
        <div class="level-right">
            <button class="button is-light" type="button" on:click={() => dispatch('close')}>
                Cerrar
            </button>
        </div>
    </div>

    <form
        method="POST"
        action={mode === 'create' ? '?/create' : '?/update'}
        use:enhance={submitHandler}
    >
        <FormAlert message={formMessage} {formErrors} variant="danger" />

        {#if mode === 'edit'}
            <input type="hidden" name="id" value={formData.id ?? ''} />
        {/if}

        <div class="columns is-multiline">
            <div class="column is-12">
                <div class="field">
                    <label class="label">Nombre</label>
                    <div class="control">
                        <input 
                            class="input {hasFieldError(fieldErrors, 'nombre') ? 'is-danger' : ''}" 
                            name="nombre" 
                            bind:value={formData.nombre} 
                            required 
                        />
                    </div>
                    {#if firstFieldError(fieldErrors, 'nombre')}
                        <p class="help is-danger">{firstFieldError(fieldErrors, 'nombre')}</p>
                    {/if}
                    <p class="help">
                        La clave se genera automáticamente (4 dígitos + letras del nombre).
                    </p>
                </div>
            </div>

            <div class="column is-12">
                <div class="field">
                    <label class="label">Descripción (opcional)</label>
                    <div class="control">
                        <input
                            class="input {hasFieldError(fieldErrors, 'descripcion') ? 'is-danger' : ''}"
                            name="descripcion"
                            bind:value={formData.descripcion}
                        />
                    </div>
                    {#if firstFieldError(fieldErrors, 'descripcion')}
                        <p class="help is-danger">{firstFieldError(fieldErrors, 'descripcion')}</p>
                    {/if}
                </div>
            </div>

            <div class="column is-12">
                <div class="is-flex is-justify-content-flex-end gap-2">
                    <button class="button is-primary" type="submit">
                        {mode === 'create' ? 'Guardar' : 'Actualizar'}
                    </button>
                    <button class="button is-light" type="button" on:click={() => dispatch('close')}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>