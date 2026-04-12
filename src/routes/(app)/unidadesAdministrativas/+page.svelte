<script lang="ts">
	import { enhance } from '$app/forms';
	import FormAlert from '$lib/components/forms/FormAlert.svelte';
	import { buildEnhanceHandler, type EnhanceFailState } from '$lib/utils/forms/actionFail';
	import { hasFieldError, firstFieldError } from '$lib/utils/forms/field';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import BotonExportar from '$lib/components/botones/botonExportar.svelte';
	import { hasPermiso } from '$lib/utils/permisos';
	import ModalCrearDivisionRapida from '$lib/components/modales/ModalCrearDivisionRapida.svelte';
	import { toast } from 'svelte-sonner';
	import UnidadTable from '$lib/components/forms/TableForms.svelte';

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

	const tableColumns = [
		{ label: 'Clave', key: 'clave' },
		{ label: 'Siglas', key: 'siglas' },
		{ label: 'Descripción', key: 'descripcion' },
		{
			label: 'División',
			key: 'division',
			transform: (val: any) =>
				val ? `${val.siglas} — ${val.descripcion ?? val.clave}` : '-'
		}
	];

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

	function handleSelect(event: CustomEvent) {
		selectedId = event.detail.id;
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
				<BotonExportar
					dataToExport={data.unidades}
					filename="unidades_ujat"
					title="Listado de Unidades Administrativas"
				/>
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
		 <UnidadTable
			columns={tableColumns}
			items={data.unidades}
			{selectedId}
			on:select={handleSelect}
		/>
	</div>

	<ModalCrearDivisionRapida
		bind:open={modalDivision}
		on:created={onDivisionCreated}
		on:close={() => (modalDivision = false)}
	/>
</section>
