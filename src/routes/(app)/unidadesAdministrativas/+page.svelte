<script lang="ts">
	import { enhance } from '$app/forms';
	import FormAlert from '$lib/components/forms/FormAlert.svelte';
	import { buildEnhanceHandler, type EnhanceFailState } from '$lib/utils/forms/actionFail';
	import { hasFieldError, firstFieldError } from '$lib/utils/forms/field';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	import { hasPermiso } from '$lib/utils/permisos';
	import ModalCrearDivisionRapida from '$lib/components/modales/ModalCrearDivisionRapida.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';

	type ZodFlattened = {
		formErrors: string[];
		fieldErrors: Record<string, string[]>;
	};

	type ActionFailData = {
		message: string;
		issues?: ZodFlattened;
	};

	export let data: {
		unidades: any[];
		divisiones: any[];
		q: string;
		divisionId: number | null;
		permisos: string[];
	};

	const permisos = data.permisos ?? [];

	let formMessage: string | null = null;
	let formErrors: string[] = [];
	let fieldErrors: Record<string, string[] | undefined> = {};

	let q = data.q ?? '';
	let divisionId = data.divisionId ?? null;

	let selectedId: number | null = null;
	$: selected = data.unidades.find((x) => x.id === selectedId) ?? null;

	let showForm = false;
	let mode: 'create' | 'edit' = 'create';

	let id: number | null = null;
	let siglas = '';
	let descripcion = '';
	let formDivisionId: string = '';

	let modalDivision = false;

	const handleUnidadSubmit = buildEnhanceHandler({
		clear: () => {
			formMessage = null;
			formErrors = [];
			fieldErrors = {};
		},
		onSuccess: async () => {
			showForm = false;
			toast.success('La unidad se agrego correctamente');
			await invalidateAll();
		},
		onFailure: (state: EnhanceFailState) => {
			formMessage = state.message;
			formErrors = state.formErrors;
			fieldErrors = state.fieldErrors;
		}
	});

	function resetForm() {
		id = null;
		siglas = '';
		descripcion = '';
		formDivisionId = divisionId ? String(divisionId) : '';
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
		siglas = selected.siglas ?? '';
		descripcion = selected.descripcion ?? '';
		formDivisionId = selected?.divisionId ? String(selected.divisionId) : '';
	}

	function closeForm() {
		showForm = false;
	}

	function selectRow(row: any) {
		selectedId = row.id;
	}

	// Cuando el modal crea una división:
	// 1) la agregamos a la lista (para el select)
	// 2) la dejamos seleccionada en el formulario
	function onDivisionCreated(e: CustomEvent<{ division: any }>) {
		const div = e.detail.division;
		data.divisiones = [div, ...data.divisiones];
		formDivisionId = div.id;
	}
</script>

<section class="section">
	<div class="container">
		<!-- Título -->
		<div class="level">
			<div class="level-left">
				<h1 class="title is-4">Unidades administrativas</h1>
			</div>

			{#if selected}
				<div class="level-right">
					<span class="tag is-light">
						Seleccionado:
						<strong style="margin-left:.5rem">{selected.clave}</strong>
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
							<label class="label">Buscar por clave, siglas, descripción o división</label>
							<div class="control">
								<input
									class="input"
									name="q"
									placeholder="Ej: 0421... o 'DACEA'..."
									bind:value={q}
								/>
							</div>
						</div>
					</div>

					<div class="column is-4">
						<div class="field">
							<label class="label">Filtrar por división</label>
							<div class="control">
								<div class="select is-fullwidth">
									<select name="divisionId" bind:value={divisionId}>
										<option value="">Todas</option>
										{#each data.divisiones as d (d.id)}
											<option value={d.id}>{d.siglas} — {d.descripcion ?? d.clave}</option>
										{/each}
									</select>
								</div>
							</div>
						</div>
					</div>

					<div class="column is-2 has-text-right">
						<button class="button is-primary" type="submit">Buscar</button>
					</div>
				</div>
			</form>

			<!-- Botones -->
			<div class="is-flex is-justify-content-flex-end gap-2">
				{#if hasPermiso(permisos, 'UNIDADES_CREAR')}
					<button class="button is-primary" type="button" on:click={openCreate}>Agregar</button>
				{/if}

				{#if hasPermiso(permisos, 'UNIDADES_EDITAR')}
					<button class="button is-light" type="button" on:click={openEdit} disabled={!selected}
						>Editar</button
					>
				{/if}
			</div>

			<!-- Form colapsable -->
			{#if showForm}
				<div class="box" style="margin-top: 1rem;">
					<div class="level">
						<div class="level-left">
							<h2 class="title is-5">
								{mode === 'create'
									? 'Agregar unidad administrativa'
									: 'Editar unidad administrativa'}
							</h2>
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
						<!-- Mensaje general (arriba del form) -->
						<FormAlert message={formMessage} {formErrors} variant="danger" />

						{#if mode === 'edit'}
							<input type="hidden" name="id" value={id ?? ''} />
						{/if}

						<div class="columns is-multiline">
							<div class="column is-6">
								<div class="field">
									<label class="label">Siglas</label>

									<div class="control">
										<input
											class="input {hasFieldError(fieldErrors, 'siglas') ? 'is-danger' : ''}"
											name="siglas"
											bind:value={siglas}
											required
											placeholder="Ej: RH"
										/>
									</div>

									{#if firstFieldError(fieldErrors, 'siglas')}
										<p class="help is-danger">{firstFieldError(fieldErrors, 'siglas')}</p>
									{:else}
										<p class="help">La clave se genera automáticamente (helper).</p>
									{/if}
								</div>
							</div>

							<div class="column is-6">
								{#if $page.data.roles.includes('SUPER_ADMIN')}
									<label class="label">División</label>

									<div class="field has-addons">
										<div class="control is-expanded">
											<div
												class="select is-fullwidth {hasFieldError(fieldErrors, 'divisionId')
													? 'is-danger'
													: ''}"
											>
												<select name="divisionId" bind:value={formDivisionId} required>
													<option value="" disabled>Selecciona una división</option>
													{#each data.divisiones as d (d.id)}
														<option value={String(d.id)}>
															{d.siglas} — {d.descripcion ?? d.clave}
														</option>
													{/each}
												</select>
											</div>

											{#if firstFieldError(fieldErrors, 'divisionId')}
												<p class="help is-danger">{firstFieldError(fieldErrors, 'divisionId')}</p>
											{:else}
												<p class="help">
													Si no existe la división, créala con “+” sin salir de aquí.
												</p>
											{/if}
										</div>

										{#if hasPermiso(permisos, 'DIVISION_CREAR')}
											<div class="control">
												<button
													class="button is-light"
													type="button"
													title="Crear división"
													on:click={() => (modalDivision = true)}
												>
													+
												</button>
											</div>
										{/if}
									</div>
								{:else}
									<label class="label">División</label>
									<div class="control">
										<input type="hidden" name="divisionId" value={$page.data.division.id} />
										<input
											class="input is-static"
											type="text"
											value={$page.data.division.descripcion}
											readonly
										/>
									</div>
									<p class="help">Tu registro se asociará a tu división actual.</p>
								{/if}
							</div>

							<div class="column is-12">
								<div class="field">
									<label class="label">Descripción (opcional)</label>
									<div class="control">
										<input
											class="input {hasFieldError(fieldErrors, 'descripcion') ? 'is-danger' : ''}"
											name="descripcion"
											bind:value={descripcion}
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
							<th>Siglas</th>
							<th>Descripción</th>
							<th>División</th>
						</tr>
					</thead>

					<tbody>
						{#if data.unidades.length === 0}
							<tr>
								<td colspan="4" class="has-text-centered">Sin resultados</td>
							</tr>
						{:else}
							{#each data.unidades as row (row.id)}
								<tr
									class={row.id === selectedId ? 'is-selected' : ''}
									on:click={() => selectRow(row)}
									style="cursor:pointer"
								>
									<td><strong>{row.clave}</strong></td>
									<td>{row.siglas ?? '-'}</td>
									<td>{row.descripcion ?? '-'}</td>
									<td
										>{row.division?.siglas ?? '-'} — {row.division?.descripcion ??
											row.division?.clave ??
											'-'}</td
									>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<ModalCrearDivisionRapida
		bind:open={modalDivision}
		on:created={onDivisionCreated}
		on:close={() => (modalDivision = false)}
	/>
</section>
