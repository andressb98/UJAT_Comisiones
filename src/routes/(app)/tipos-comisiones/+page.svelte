<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { buildEnhanceHandler, type EnhanceFailState } from '$lib/utils/forms/actionFail';
	import { hasPermiso } from '$lib/utils/permisos';
	import BotonExportar from '$lib/components/botones/botonExportar.svelte';
	import TipoTable from '$lib/components/forms/TableForms.svelte';
	import TipoComisionForm from '$lib/components/forms/TiposComisionForms/tipoForm.svelte';


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

	let formData = {
		id: null as number | null,
		nombre: '',
		descripcion: ''
	};

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

	const tableColumns = [
		{ label: 'Clave', key: 'clave' },
		{ label: 'Nombre', key: 'nombre' },
		{ label: 'Descripción', key: 'descripcion' },
		{ label: 'Departamento creador', key: 'departamentoCreador' },
		{
			label: 'Estado',
			key: 'activo',
			transform: (val: boolean) =>
				val === false
					? '<span class="tag is-danger">INACTIVO</span>'
					: '<span class="tag is-success">ACTIVO</span>'
		}
	];

	function resetForm() {
		formData = { id: null, nombre: '', descripcion: '' };
	}

	// Actualiza el openEdit
	function openEdit() {
		if (!selected) return;
		mode = 'edit';
		showForm = true;
		formData = {
			id: selected.id,
			nombre: selected.nombre ?? '',
			descripcion: selected.descripcion ?? ''
		};
	}

	function openCreate() {
		mode = 'create';
		selectedId = null;
		resetForm();
		showForm = true;
	}

	function closeForm() {
		showForm = false;
	}

	function handleSelect(event: CustomEvent) {
		selectedId = event.detail.id;
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
				<BotonExportar
					dataToExport={data.tiposComision}
					filename="tipos_comision_ujat"
					title="Listado de Tipos de Comisión"
				/>
			</div>

			<!-- Form colapsable -->
			{#if showForm}
				<TipoComisionForm
					{mode}
					bind:formData
					{formMessage}
					{formErrors}
					{fieldErrors}
					submitHandler={handleSubmit}
					on:close={closeForm}
				/>
			{/if}
		</div>

		<!-- Tabla -->
		<TipoTable
			columns={tableColumns}
			items={data.tiposComision}
			{selectedId}
			on:select={handleSelect}
		/>
	</div>
</section>
