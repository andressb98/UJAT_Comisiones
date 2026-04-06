<script lang="ts">
	import { enhance } from '$app/forms';
	import FormAlert from '$lib/components/forms/FormAlert.svelte';
	import { buildEnhanceHandler, type EnhanceFailState } from '$lib/utils/forms/actionFail';
	import { hasFieldError, firstFieldError } from '$lib/utils/forms/field';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import BotonExportar from '$lib/components/botones/BotonExportar.svelte';
	import { hasPermiso } from '$lib/utils/permisos';

	export let data: {
		lugares: any[];
		q: string;
		includeInactive: boolean;
		permisos: string[];
	};

	let formMessage: string | null = null;
	let formErrors: string[] = [];
	let fieldErrors: Record<string, string[] | undefined> = {};

	const handleUnidadSubmit = buildEnhanceHandler({
		clear: () => {
			formMessage = null;
			formErrors = [];
			fieldErrors = {};
		},
		onSuccess: async () => {
			showForm = false;
			toast.success('El lugar se agregó correctamente');

			await invalidateAll();
		},
		onFailure: (state: EnhanceFailState) => {
			formMessage = state.message;
			formErrors = state.formErrors;
			fieldErrors = state.fieldErrors;
		}
	});

	const permisos = data.permisos ?? [];

	let q = data.q ?? '';
	let includeInactive = data.includeInactive ?? false;

	let selectedId: number | null = null;
	$: selected = data.lugares.find((x) => x.id === selectedId) ?? null;

	let showForm = false;
	let mode: 'create' | 'edit' = 'create';

	let id: number | null = null;
	let descripcion = '';
	let tipoUbicacion = '';
	let edificio = '';
	let salonOficinaAula = '';
	let municipioCiudad = '';
	let coloniaBarrio = '';

	function resetForm() {
		id = null;
		descripcion = '';
		tipoUbicacion = '';
		edificio = '';
		salonOficinaAula = '';
		municipioCiudad = '';
		coloniaBarrio = '';
	}

	function openCreate() {
		mode = 'create';
		selectedId = null;
		resetForm();
		showForm = true;
	}

	function openEdit() {
		if (!selected) return;
		mode = 'edit';
		showForm = true;

		id = selected.id;
		descripcion = selected.descripcion ?? '';
		tipoUbicacion = selected.tipoUbicacion ?? '';
		edificio = selected.edificio ?? '';
		salonOficinaAula = selected.salonOficinaAula ?? '';
		municipioCiudad = selected.municipioCiudad ?? '';
		coloniaBarrio = selected.coloniaBarrio ?? '';
	}

	function closeForm() {
		showForm = false;
	}

	function selectRow(row: any) {
		selectedId = row.id;
	}
</script>

<section class="section">
	<div class="container">
		<!-- Título -->
		<div class="level">
			<div class="level-left">
				<h1 class="title is-4">Lugares</h1>
			</div>
			{#if selected}
				<div class="level-right">
					<span class="tag is-light">
						Seleccionado: <strong style="margin-left:.5rem">{selected.clave}</strong>
					</span>
				</div>
			{/if}
		</div>

		<!-- Filtro -->
		<div class="box">
			<form method="GET">
				<div class="columns is-vcentered is-multiline">
					<div class="column is-6">
						<div class="field">
							<label class="label">Buscar por clave o descripción</label>
							<div class="control">
								<input
									class="input"
									name="q"
									placeholder="Ej: 0421AUD o 'Auditorio'"
									bind:value={q}
								/>
							</div>
						</div>
					</div>

					<div class="column is-3">
						<div class="field">
							<label class="checkbox">
								<input type="checkbox" name="all" value="1" bind:checked={includeInactive} />
								<span style="margin-left:.5rem">Mostrar inactivos</span>
							</label>
						</div>
					</div>

					<div class="column is-3 has-text-right">
						<button class="button is-primary" type="submit">Buscar</button>
					</div>
				</div>
			</form>

			<!-- Botones -->
			<div class="is-flex is-justify-content-flex-end gap-2">
				{#if hasPermiso(permisos, 'LUGARES_CREAR')}
					<button class="button is-primary" type="button" on:click={openCreate}> Agregar </button>

					<button class="button is-light" type="button" on:click={openEdit} disabled={!selected}>
						Editar
					</button>

					<form method="POST" action="?/toggle" use:enhance>
						<input type="hidden" name="id" value={selected?.id ?? ''} />
						<button class="button is-light" type="submit" disabled={!selected}>
							{selected?.activo === false ? 'Activar' : 'Desactivar'}
						</button>
					</form>
				{/if}
				<BotonExportar
					dataToExport={data.lugares}
					filename="lugares_ujat"
					title="Listado de Lugares"
				/>
			</div>

			<!-- Form colapsable -->
			{#if showForm}
				<div class="box" style="margin-top: 1rem;">
					<div class="level">
						<div class="level-left">
							<h2 class="title is-5">{mode === 'create' ? 'Agregar lugar' : 'Editar lugar'}</h2>
						</div>
						<div class="level-right">
							<button class="button is-light" type="button" on:click={closeForm}>Cerrar</button>
						</div>
					</div>

					<form
						method="POST"
						action={mode === 'create' ? '?/create' : '?/update'}
						use:enhance={handleUnidadSubmit}
					>
						<FormAlert message={formMessage} {formErrors} variant="danger" />

						{#if mode === 'edit'}
							<input type="hidden" name="id" value={id ?? ''} />
						{/if}

						<div class="columns is-multiline">
							<div class="column is-12">
								<div class="field">
									<label class="label">Descripción</label>
									<div class="control">
										<input class="input" name="descripcion" bind:value={descripcion} />
									</div>
									<p class="help">
										La clave se genera automáticamente (4 dígitos + letras de la descripción).
									</p>
								</div>
							</div>

							<div class="column is-4">
								<div class="field">
									<label class="label">Tipo de ubicación</label>
									<div class="control select is-fullwidth">
										<select name="tipoUbicacion" bind:value={tipoUbicacion}>
											<option value="">(opcional)</option>
											<option value="AULA">AULA</option>
											<option value="OFICINA">OFICINA</option>
											<option value="EDIFICIO">EDIFICIO</option>
											<option value="VIRTUAL">VIRTUAL</option>
											<option value="OTRO">OTRO</option>
										</select>
									</div>
								</div>
							</div>

							<div class="column is-4">
								<div class="field">
									<label class="label">Edificio</label>
									<div class="control">
										<input class="input" name="edificio" bind:value={edificio} />
									</div>
								</div>
							</div>

							<div class="column is-4">
								<div class="field">
									<label class="label">Salón / Oficina / Aula</label>
									<div class="control">
										<input class="input" name="salonOficinaAula" bind:value={salonOficinaAula} />
									</div>
								</div>
							</div>

							<div class="column is-6">
								<div class="field">
									<label class="label">Municipio / Ciudad</label>
									<div class="control">
										<input class="input" name="municipioCiudad" bind:value={municipioCiudad} />
									</div>
								</div>
							</div>

							<div class="column is-6">
								<div class="field">
									<label class="label">Colonia / Barrio</label>
									<div class="control">
										<input class="input" name="coloniaBarrio" bind:value={coloniaBarrio} />
									</div>
								</div>
							</div>

							<div class="column is-12">
								<div class="is-flex is-justify-content-flex-end gap-2">
									<button class="button is-primary" type="submit">
										{mode === 'create' ? 'Guardar' : 'Actualizar'}
									</button>
									<button class="button is-light" type="button" on:click={closeForm}>
										Cancelar
									</button>
								</div>
							</div>
						</div>
					</form>
				</div>
			{/if}
		</div>

		<!-- Tabla -->
		<div class="box">
			<div class="table-container">
				<table class="table is-fullwidth is-hoverable">
					<thead>
						<tr>
							<th>Clave</th>
							<th>Descripción</th>
							<th>Tipo</th>
							<th>Edificio</th>
							<th>Salón/Oficina</th>
							<th>Ciudad</th>
							<th>Colonia</th>
							<th>Estado</th>
						</tr>
					</thead>

					<tbody>
						{#if data.lugares.length === 0}
							<tr>
								<td colspan="8" class="has-text-centered">Sin resultados</td>
							</tr>
						{:else}
							{#each data.lugares as row (row.id)}
								<tr
									class={row.id === selectedId ? 'is-selected' : ''}
									on:click={() => selectRow(row)}
									style="cursor:pointer"
								>
									<td><strong>{row.clave}</strong></td>
									<td>{row.descripcion ?? '-'}</td>
									<td>{row.tipoUbicacion ?? '-'}</td>
									<td>{row.edificio ?? '-'}</td>
									<td>{row.salonOficinaAula ?? '-'}</td>
									<td>{row.municipioCiudad ?? '-'}</td>
									<td>{row.coloniaBarrio ?? '-'}</td>
									<td>{row.activo === false ? 'INACTIVO' : 'ACTIVO'}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>
