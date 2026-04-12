<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { buildEnhanceHandler, type EnhanceFailState } from '$lib/utils/forms/actionFail';
	import { hasPermiso } from '$lib/utils/permisos';
	import BotonExportar from '$lib/components/botones/botonExportar.svelte';
	import DocenteForm from '$lib/components/forms/docenteForms/DocenteForm.svelte';
	import DocenteTable from '$lib/components/forms/TableForms.svelte';

	export let data: {
		docentes: any[];
		q: string;
		includeInactive: boolean;
		divisionId: number | null;

		divisiones: any[];
		permisos: string[];
	};
	let formData = {
		id: null as number | null,
		cveProf: '',
		divisionIdForm: '' as number | '',
		areaConProf: '',
		gradoPrefijo: '',
		gradoEspecialidad: '',
		nombreProf: '',
		apePatProf: '',
		apeMatProf: '',
		contratoProf: '',
		cateProf: '',
		correoProf: ''
	};

	let gradoMsg: string | null = null;
	let gradoFieldErrors: Record<string, string[] | undefined> = {};

	let formMessage: string | null = null;
	let formErrors: string[] = [];
	let fieldErrors: Record<string, string[] | undefined> = {};

	let showGradoModal = false;
	let nuevoGradoNombre = '';
	let nuevoGradoClave = '';
	let gradoProfId: number | '' = '';

	const handleSubmit = buildEnhanceHandler({
		clear: () => {
			formMessage = null;
			formErrors = [];
			fieldErrors = {};
		},
		onSuccess: async () => {
			showForm = false;
			toast.success(
				mode === 'create'
					? 'El docente se agregó correctamente'
					: 'El docente se actualizó correctamente'
			);
			await invalidateAll();
		},
		onFailure: (state: EnhanceFailState) => {
			formMessage = state.message;
			formErrors = state.formErrors;
			fieldErrors = state.fieldErrors;
		}
	});

	const handleGradoSubmit = () => {
		gradoMsg = null;
		gradoFieldErrors = {};

		return async ({ result }) => {
			if (result.type === 'success') {
				const payload = result.data;
				const createdId = payload?.createdId as number | undefined;

				if (createdId) {
					gradoProfId = createdId; // ✅ autoselecciona
				}

				showGradoModal = false;
				nuevoGradoNombre = '';
				nuevoGradoClave = '';

				toast.success('Grado agregado');
				await invalidateAll();
			}

			if (result.type === 'failure') {
				const data = result.data;
				gradoMsg = typeof data?.message === 'string' ? data.message : 'Revisa los datos.';
				gradoFieldErrors = data?.issues?.fieldErrors ?? {};
			}
		};
	};

	const permisos = data.permisos ?? [];

	let q = data.q ?? '';
	let includeInactive = data.includeInactive ?? false;
	let divisionId = data.divisionId ?? null;

	let selectedId: number | null = null;
	$: selected = data.docentes.find((x) => x.id === selectedId) ?? null;

	let showForm = false;
	let mode: 'create' | 'edit' = 'create';

	function resetForm() {
		formData = {
			id: null,
			cveProf: '',
			divisionIdForm: '',
			areaConProf: '',
			gradoPrefijo: '',
			gradoEspecialidad: '',
			nombreProf: '',
			apePatProf: '',
			apeMatProf: '',
			contratoProf: '',
			cateProf: '',
			correoProf: ''
		};
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

		// 2. Llenamos el objeto de un solo golpe
		formData = {
			id: selected.id,
			cveProf: selected.cveProf ?? '',
			divisionIdForm: selected.divisionId ?? '',
			areaConProf: selected.areaConProf ?? '',
			gradoPrefijo: selected.gradoPrefijo ?? '',
			gradoEspecialidad: selected.gradoEspecialidad ?? '',
			nombreProf: selected.nombreProf ?? '',
			apePatProf: selected.apePatProf ?? '',
			apeMatProf: selected.apeMatProf ?? '',
			contratoProf: selected.contratoProf ?? '',
			cateProf: selected.cateProf ?? '',
			correoProf: selected.correoProf ?? ''
		};
	}

	function closeForm() {
		showForm = false;
	}

	function fullName(d: any) {
		const parts = [d?.nombreProf, d?.apePatProf, d?.apeMatProf].filter(Boolean);
		return parts.join(' ');
	}

	function selectRow(event: CustomEvent) {
		const row = event.detail;
		selectedId = row.id;
	}

	//Helpers de errores para debbug

	const hasFieldError = (errors: Record<string, string[] | undefined>, field: string) =>
		errors[field]?.length;
	const firstFieldError = (errors: Record<string, string[] | undefined>, field: string) =>
		errors[field]?.[0];

	const tableColumns = [
		{ label: 'Clave', key: 'cveProf' },
		{
			label: 'Nombre',
			key: 'nombreProf',
			// Transformamos los datos para unir el nombre completo
			transform: (_, row) => `${row.nombreProf} ${row.apePatProf} ${row.apeMatProf || ''}`
		},
		{
			label: 'División',
			key: 'division',
			transform: (val) => val?.descripcion ?? val?.clave ?? '-'
		},
		{
			label: 'Estado',
			key: 'activo',
			transform: (val) =>
				val === false
					? '<span class="tag is-danger">INACTIVO</span>'
					: '<span class="tag is-success">ACTIVO</span>'
		}
	];

	function handleSelect(event: CustomEvent) {
		selectedId = event.detail.id;
	}
</script>

<section class="section">
	<div class="container">
		<!-- Título -->
		<div class="level">
			<div class="level-left">
				<h1 class="title is-4">Docentes</h1>
			</div>

			{#if selected}
				<div class="level-right">
					<span class="tag is-light">
						Seleccionado:
						<strong style="margin-left:.5rem">{selected.cveProf}</strong>
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
							<label class="label">Buscar</label>
							<div class="control">
								<input
									class="input"
									name="q"
									placeholder="Clave, nombre, correo, área, grado, división..."
									bind:value={q}
								/>
							</div>
						</div>
					</div>

					<div class="column is-3">
						<div class="field" style="margin-top: 1.75rem;">
							<label class="checkbox">
								<input type="checkbox" name="all" value="1" bind:checked={includeInactive} />
								<span style="margin-left:.5rem">Mostrar inactivos</span>
							</label>
						</div>
					</div>

					<div class="column is-12 has-text-right">
						<button class="button is-primary" type="submit">Buscar</button>
					</div>
				</div>
			</form>

			<!-- Botones -->
			<div class="is-flex is-justify-content-flex-end gap-2">
				{#if hasPermiso(permisos, 'DOCENTES_CREAR')}
					<button class="button is-primary" type="button" on:click={openCreate}>Agregar</button>
				{/if}

				{#if hasPermiso(permisos, 'DOCENTES_EDITAR')}
					<button class="button is-light" type="button" on:click={openEdit} disabled={!selected}
						>Editar</button
					>
				{/if}

				{#if hasPermiso(permisos, 'DOCENTES_DESACTIVAR')}
					<form method="POST" action="?/toggle" use:enhance={handleSubmit}>
						<input type="hidden" name="id" value={selected?.id ?? ''} />
						<button class="button is-light" type="submit" disabled={!selected}>
							{selected?.activo === false ? 'Activar' : 'Desactivar'}
						</button>
					</form>
				{/if}
				<BotonExportar
					dataToExport={data.docentes}
					filename="docentes_ujat"
					title="Listado de Docentes"
				/>
			</div>

			<!-- Form colapsable -->
			{#if showForm}
				<DocenteForm
					{mode}
					bind:formData
					divisiones={data.divisiones}
					{formMessage}
					{formErrors}
					{fieldErrors}
					submitHandler={handleSubmit}
					on:close={closeForm}
				/>
			{/if}
		</div>

		<!-- Tabla -->
		<DocenteTable
			columns={tableColumns}
			items={data.docentes}
			{selectedId}
			on:select={handleSelect}
		/>
	</div>
</section>

{#if showGradoModal}
	<div class="modal is-active">
		<div class="modal-background" on:click={() => (showGradoModal = false)} />
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Agregar grado</p>
				<button
					class="delete"
					aria-label="close"
					type="button"
					on:click={() => (showGradoModal = false)}
				/>
			</header>

			<form method="POST" action="?/createGradoCorto" use:enhance={handleGradoSubmit}>
				<section class="modal-card-body">
					{#if gradoMsg}
						<article class="message is-danger">
							<div class="message-body">{gradoMsg}</div>
						</article>
					{/if}

					<div class="field">
						<label class="label">Nombre</label>
						<div class="control">
							<input
								class="input"
								name="nombre"
								bind:value={nuevoGradoNombre}
								placeholder="Ej: Ingeniero"
							/>
						</div>
						{#if gradoFieldErrors.nombre?.length}
							<p class="help is-danger">{gradoFieldErrors.nombre[0]}</p>
						{/if}
					</div>

					<div class="field">
						<label class="label">Clave</label>
						<div class="control">
							<input
								class="input"
								name="clave"
								bind:value={nuevoGradoClave}
								placeholder="Ej: ING"
							/>
						</div>
						<p class="help">Única. Útil para catálogos.</p>
						{#if gradoFieldErrors.clave?.length}
							<p class="help is-danger">{gradoFieldErrors.clave[0]}</p>
						{/if}
					</div>
				</section>

				<footer class="modal-card-foot is-justify-content-flex-end">
					<button class="button" type="button" on:click={() => (showGradoModal = false)}>
						Cancelar
					</button>
					<button class="button is-primary" type="submit"> Guardar </button>
				</footer>
			</form>
		</div>
	</div>
{/if}
