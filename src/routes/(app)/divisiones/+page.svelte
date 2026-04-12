<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	import FormAlert from '$lib/components/forms/FormAlert.svelte';
	import { buildEnhanceHandler, type EnhanceFailState } from '$lib/utils/forms/actionFail';
	import { hasFieldError, firstFieldError } from '$lib/utils/forms/field';
	import { hasPermiso } from '$lib/utils/permisos';
	import DivisionesTable from '$lib/components/forms/TableForms.svelte';

	export let data: {
		divisiones: any[];
		q: string;
		permisos: string[];
	};

	const permisos = data.permisos ?? [];

	let formMessage: string | null = null;
	let formErrors: string[] = [];
	let fieldErrors: Record<string, string[] | undefined> = {};

	let q = data.q ?? '';

	let selectedId: number | null = null;
	$: selected = data.divisiones.find((x) => x.id === selectedId) ?? null;

	let showForm = false;
	let mode: 'create' | 'edit' = 'create';

	let id: number | null = null;
	let siglas = '';
	let descripcion = '';

	const handleDivisionSubmit = buildEnhanceHandler({
		clear: () => {
			formMessage = null;
			formErrors = [];
			fieldErrors = {};
		},
		onSuccess: async () => {
			showForm = false;
			toast.success(mode === 'create' ? 'La división se agregó correctamente' : 'La división se actualizó correctamente');
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
		{ label: 'Descripción', key: 'descripcion' }
	];

	function resetForm() {
		id = null;
		siglas = '';
		descripcion = '';
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
	}

	function closeForm() {
		showForm = false;
	}

	function selectRow(row: any) {
		if (selectedId === row.id) {
			selectedId = null;
		} else {
			selectedId = row.id;
		}
	}
</script>

<section class="section">
	<div class="container">
		<!-- Título -->
		<div class="level">
			<div class="level-left">
				<h1 class="title is-4">Divisiones</h1>
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
					<div class="column is-10">
						<div class="field">
							<label class="label">Buscar por clave, siglas o descripción</label>
							<div class="control">
								<input
									class="input"
									name="q"
									placeholder="Ej: DACEA, 0421..., 'División Académica...'"
									bind:value={q}
								/>
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
				{#if hasPermiso(permisos, 'DIVISION_CREAR')}
					<button class="button is-primary" type="button" on:click={openCreate}>Agregar</button>
				{/if}

				{#if hasPermiso(permisos, 'DIVISION_EDITAR')}
					<button class="button is-light" type="button" on:click={openEdit} disabled={!selected}>
						Editar
					</button>
				{/if}
			</div>

			<!-- Form colapsable -->
			{#if showForm}
				<div class="box" style="margin-top: 1rem;">
					<div class="level">
						<div class="level-left">
							<h2 class="title is-5">{mode === 'create' ? 'Agregar división' : 'Editar división'}</h2>
						</div>
						<div class="level-right">
							<button class="button is-light" type="button" on:click={closeForm}>Cerrar</button>
						</div>
					</div>

					<form
						method="POST"
						action={mode === 'create' ? '?/create' : '?/update'}
						use:enhance={handleDivisionSubmit}
					>
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
											placeholder="Ej: DACEA"
										/>
									</div>

									{#if firstFieldError(fieldErrors, 'siglas')}
										<p class="help is-danger">{firstFieldError(fieldErrors, 'siglas')}</p>
									{:else}
										<p class="help">La clave se genera automáticamente.</p>
									{/if}
								</div>
							</div>

							<div class="column is-6">
								<div class="field">
									<label class="label">Descripción (opcional)</label>
									<div class="control">
										<input
											class="input {hasFieldError(fieldErrors, 'descripcion') ? 'is-danger' : ''}"
											name="descripcion"
											bind:value={descripcion}
											placeholder="Ej: División Académica de..."
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
		<DivisionesTable
			columns={tableColumns}
			items={data.divisiones}
			{selectedId}
			on:select={selectRow}
		/>
	</div>
</section>
