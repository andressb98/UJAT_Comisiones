<script lang="ts">
	import { page } from '$app/stores';
	import FormAlert from '$lib/components/forms/FormAlert.svelte';
	import { createEventDispatcher } from 'svelte';
	import { enhance } from '$app/forms';

	const dispatch = createEventDispatcher();

	// Props que recibimos del padre (+page.svelte)
	export let mode: 'create' | 'edit';
	export let formData: any; 
	export let divisiones: any[];
	export let formMessage: string | null;
	export let formErrors: string[];
	export let fieldErrors: Record<string, string[] | undefined>;
	export let submitHandler: any;

	const hasFieldError = (errors: Record<string, string[] | undefined>, field: string) => errors[field]?.length;
</script>

<div class="box" style="margin-top: 1rem;">
	<div class="level">
		<div class="level-left">
			<h2 class="title is-5">{mode === 'create' ? 'Agregar docente' : 'Editar docente'}</h2>
		</div>
		<div class="level-right">
			<button class="button is-light" type="button" on:click={() => dispatch('close')}>Cerrar</button>
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
			<div class="column is-4">
				<div class="field">
					<label class="label">Clave (cveProf)</label>
					<div class="control">
						<input
							class="input {hasFieldError(fieldErrors, 'cveProf') ? 'is-danger' : ''}"
							name="cveProf"
							bind:value={formData.cveProf}
							placeholder="Ej: 202H17041"
						/>
					</div>
					{#if fieldErrors.cveProf?.length}
						<p class="help is-danger">{fieldErrors.cveProf[0]}</p>
					{/if}
					{#if mode === 'edit'}
						<p class="help">La clave no se edita (es única).</p>
					{/if}
				</div>
			</div>

			<div class="column is-4">
				<div class="field">
					<label class="label">División</label>

					{#if $page.data.roles.includes('SUPER_ADMIN')}
						<div class="control select is-fullwidth {fieldErrors.divisionId?.length ? 'is-danger' : ''}">
							<select name="divisionId" bind:value={formData.divisionIdForm}>
								<option value="">(selecciona)</option>
								{#each divisiones as dv (dv.id)}
									<option value={dv.id}>
										{dv.descripcion ?? dv.clave ?? `División ${dv.id}`}
									</option>
								{/each}
							</select>
						</div>
					{:else}
						<div class="control">
							<input type="hidden" name="divisionId" value={$page.data.division.id} />
							<input
								class="input is-static"
								type="text"
								value={$page.data.division.descripcion ?? $page.data.division.clave}
								readonly
							/>
						</div>
					{/if}

					{#if fieldErrors.divisionId?.length}
						<p class="help is-danger">{fieldErrors.divisionId[0]}</p>
					{/if}
				</div>
			</div>

			<div class="column is-4">
				<div class="field">
					<label class="label">Grado (Ing / Mtro / Dr)</label>
					<div class="field has-addons">
						<p class="control is-expanded">
							<span class="select is-fullwidth">
								<select name="gradoPrefijo" bind:value={formData.gradoPrefijo}>
									<option value="">(opcional)</option>
									<option value="Ing.">Ing.</option>
									<option value="Lic.">Lic.</option>
									<option value="Mtro.">Mtro.</option>
									<option value="Mtra.">Mtra.</option>
									<option value="Dr.">Dr.</option>
									<option value="Dra.">Dra.</option>
									<option value="TSU">TSU</option>
								</select>
							</span>
						</p>
					</div>
				</div>
			</div>

			<div class="column is-4">
				<div class="field">
					<label class="label">Nombre</label>
					<div class="control">
						<input class="input" name="nombreProf" bind:value={formData.nombreProf} />
					</div>
					{#if fieldErrors.nombreProf?.length}
						<p class="help is-danger">{fieldErrors.nombreProf[0]}</p>
					{/if}
				</div>
			</div>

			<div class="column is-4">
				<div class="field">
					<label class="label">Apellido paterno</label>
					<div class="control">
						<input class="input" name="apePatProf" bind:value={formData.apePatProf} />
					</div>
					{#if fieldErrors.apePatProf?.length}
						<p class="help is-danger">{fieldErrors.apePatProf[0]}</p>
					{/if}
				</div>
			</div>

			<div class="column is-4">
				<div class="field">
					<label class="label">Apellido materno</label>
					<div class="control">
						<input class="input" name="apeMatProf" bind:value={formData.apeMatProf} />
					</div>
				</div>
			</div>

			<div class="column is-4">
				<div class="field">
					<label class="label">Correo</label>
					<div class="control">
						<input
							class="input"
							name="correoProf"
							bind:value={formData.correoProf}
							placeholder="(opcional)"
						/>
					</div>
					{#if fieldErrors.correoProf?.length}
						<p class="help is-danger">{fieldErrors.correoProf[0]}</p>
					{/if}
				</div>
			</div>

			<div class="column is-4">
				<div class="field">
					<label class="label">Área</label>
					<div class="control">
						<input
							class="input"
							name="areaConProf"
							bind:value={formData.areaConProf}
							placeholder="(opcional)"
						/>
					</div>
				</div>
			</div>

			<div class="column is-4">
				<div class="field">
					<label class="label">Grado especialidad</label>
					<div class="control">
						<input
							class="input"
							name="gradoEspecialidad"
							bind:value={formData.gradoEspecialidad}
							placeholder="Ej: Ingeniería en Sistemas Computacionales"
						/>
					</div>
					{#if fieldErrors.gradoEspecialidad?.length}
						<p class="help is-danger">{fieldErrors.gradoEspecialidad[0]}</p>
					{/if}
				</div>
			</div>

			<div class="column is-4">
				<div class="field">
					<label class="label">Contrato</label>
					<div class="control">
						<input
							class="input"
							name="contratoProf"
							bind:value={formData.contratoProf}
							placeholder="(opcional)"
						/>
					</div>
				</div>
			</div>

			<div class="column is-4">
				<div class="field">
					<label class="label">Categoría</label>
					<div class="control">
						<input
							class="input"
							name="cateProf"
							bind:value={formData.cateProf}
							placeholder="(opcional)"
						/>
					</div>
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