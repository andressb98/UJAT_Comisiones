<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import FormAlert from '$lib/components/forms/FormAlert.svelte';
	import { buildEnhanceHandler, type EnhanceFailState } from '$lib/utils/forms/actionFail';
	import { hasFieldError, firstFieldError } from '$lib/utils/forms/field';
	import { hasPermiso } from '$lib/utils/permisos';

	export let data: {
		tiposComision: any[];
		q: string;
		includeInactive: boolean;
		permisos: string[];
	};

	const permisos = data.permisos ?? [];

	let formMessage: string | null = null;
	let formErrors: string[] = [];
	let fieldErrors: Record<string, string[] | undefined> = {};

	let q = data.q ?? '';
	let includeInactive = data.includeInactive ?? false;

	let selectedId: number | null = null;
	$: selected = data.tiposComision.find((x) => x.id === selectedId) ?? null;

	let showForm = false;
	let mode: 'create' | 'edit' = 'create';

	let id: number | null = null;
	let nombre = '';
	let descripcion = '';

	const handleSubmit = buildEnhanceHandler({
		clear: () => {
			formMessage = null;
			formErrors = [];
			fieldErrors = {};
		},
		onSuccess: async () => {
			showForm = false; // o lo que toque
			toast.success('El tipo de comisión se agregó correctamente');
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
		nombre = '';
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
		nombre = selected.nombre ?? '';
		descripcion = selected.descripcion ?? '';
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
				<h1 class="title is-4">Tipos de comisión</h1>
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
							<label class="label">Buscar por clave, nombre o descripción</label>
							<div class="control">
								<input
									class="input"
									name="q"
									placeholder="Ej: 0421TIP o 'Comisión'..."
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
				{#if hasPermiso(permisos, 'TIPOS_COMISION_CREAR')}
					<button class="button is-primary" type="button" on:click={openCreate}> Agregar </button>
				{/if}

				{#if hasPermiso(permisos, 'TIPOS_COMISION_EDITAR')}
					<button class="button is-light" type="button" on:click={openEdit} disabled={!selected}>
						Editar
					</button>
				{/if}

				{#if hasPermiso(permisos, 'TIPOS_COMISION_TOGGLE')}
					<form method="POST" action="?/toggle" use:enhance>
						<input type="hidden" name="id" value={selected?.id ?? ''} />
						<button class="button is-light" type="submit" disabled={!selected}>
							{selected?.activo === false ? 'Activar' : 'Desactivar'}
						</button>
					</form>
				{/if}
			</div>

			<!-- Form colapsable -->
			{#if showForm}
				<div class="box" style="margin-top: 1rem;">
					<div class="level">
						<div class="level-left">
							<h2 class="title is-5">
								{mode === 'create' ? 'Agregar tipo de comisión' : 'Editar tipo de comisión'}
							</h2>
						</div>
						<div class="level-right">
							<button class="button is-light" type="button" on:click={closeForm}>Cerrar</button>
						</div>
					</div>

					<form
						method="POST"
						action={mode === 'create' ? '?/create' : '?/update'}
						use:enhance={handleSubmit}
					>
						<FormAlert message={formMessage} {formErrors} variant="danger" />

						{#if firstFieldError(fieldErrors, 'nombre')}
							<p class="help is-danger">{firstFieldError(fieldErrors, 'nombre')}</p>
						{/if}

						{#if mode === 'edit'}
							<input type="hidden" name="id" value={id ?? ''} />
						{/if}

						<div class="columns is-multiline">
							<div class="column is-12">
								<div class="field">
									<label class="label">Nombre</label>
									<div class="control">
										<input class="input" name="nombre" bind:value={nombre} required />
									</div>
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
											bind:value={descripcion}
										/>
										{#if firstFieldError(fieldErrors, 'descripcion')}
											<p class="help is-danger">{firstFieldError(fieldErrors, 'descripcion')}</p>
										{/if}
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
							<th>Nombre</th>
							<th>Descripción</th>
							<th>Departamento creador</th>
							<th>Estado</th>
						</tr>
					</thead>

					<tbody>
						{#if data.tiposComision.length === 0}
							<tr>
								<td colspan="5" class="has-text-centered">Sin resultados</td>
							</tr>
						{:else}
							{#each data.tiposComision as row (row.id)}
								<tr
									class={row.id === selectedId ? 'is-selected' : ''}
									on:click={() => selectRow(row)}
									style="cursor:pointer"
								>
									<td><strong>{row.clave}</strong></td>
									<td>{row.nombre ?? '-'}</td>
									<td>{row.descripcion ?? '-'}</td>
									<td>{row.departamentoCreador ?? '-'}</td>
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
