<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import * as XLSX from 'xlsx';

	import FormAlert from '$lib/components/forms/FormAlert.svelte';
	import { buildEnhanceHandler, type EnhanceFailState } from '$lib/utils/forms/actionFail';
	import { hasPermiso } from '$lib/utils/permisos';

	export let data: {
		docentes: any[];
		q: string;
		includeInactive: boolean;
		divisionId: number | null;

		divisiones: any[];
		permisos: string[];
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

	// form fields
	let id: number | null = null;

	let cveProf = '';
	let divisionIdForm: number | '' = '';

	let areaConProf = '';
	let gradoPrefijo = '';
	let gradoEspecialidad = '';

	let nombreProf = '';
	let apePatProf = '';
	let apeMatProf = '';

	let contratoProf = '';
	let cateProf = '';
	let correoProf = '';

	function resetForm() {
		id = null;

		cveProf = '';
		divisionIdForm = '';

		areaConProf = '';
		gradoPrefijo = '';
		gradoEspecialidad = '';

		nombreProf = '';
		apePatProf = '';
		apeMatProf = '';

		contratoProf = '';
		cateProf = '';
		correoProf = '';
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

		cveProf = selected.cveProf ?? '';
		divisionIdForm = selected.divisionId ?? '';

		areaConProf = selected.areaConProf ?? '';
		gradoPrefijo = selected.gradoPrefijo ?? '';

		nombreProf = selected.nombreProf ?? '';
		apePatProf = selected.apePatProf ?? '';
		apeMatProf = selected.apeMatProf ?? '';

		contratoProf = selected.contratoProf ?? '';
		cateProf = selected.cateProf ?? '';
		correoProf = selected.correoProf ?? '';
	}

	function closeForm() {
		showForm = false;
	}

	function selectRow(row: any) {
		selectedId = row.id;
	}

	function fullName(d: any) {
		const parts = [d?.nombreProf, d?.apePatProf, d?.apeMatProf].filter(Boolean);
		return parts.join(' ');
	}

	function exportarAExcel() {
		const datos = data.docentes.map((d) => ({
			Clave: d.cveProf,
			Nombre: fullName(d),
			División: d.division?.descripcion ?? d.division?.clave ?? '-',
			Correo: d.correoProf ?? '-',
			Estado: d.activo === false ? 'Inactivo' : 'Activo'
		}));

		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.json_to_sheet(datos);
		XLSX.utils.book_append_sheet(wb, ws, 'Docentes');
		XLSX.writeFile(wb, 'Reporte_Docentes.xlsx');
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
				<button
					class="button is-success is-light"
					type="button"
					on:click={exportarAExcel}
					disabled={data.docentes.length === 0}
				>
					<span class="icon">
						<i class="fas fa-file-excel"></i>
					</span>
					<span>Exportar Excel</span>
				</button>
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
			</div>

			<!-- Form colapsable -->
			{#if showForm}
				<div class="box" style="margin-top: 1rem;">
					<div class="level">
						<div class="level-left">
							<h2 class="title is-5">{mode === 'create' ? 'Agregar docente' : 'Editar docente'}</h2>
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

						{#if mode === 'edit'}
							<input type="hidden" name="id" value={id ?? ''} />
						{/if}

						<div class="columns is-multiline">
							<div class="column is-4">
								<div class="field">
									<label class="label">Clave (cveProf)</label>
									<div class="control">
										<input
											class="input"
											name="cveProf"
											bind:value={cveProf}
											disabled={mode === 'edit'}
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
										<div
											class="control select is-fullwidth {fieldErrors.divisionId?.length
												? 'is-danger'
												: ''}"
										>
											<select name="divisionId" bind:value={divisionIdForm}>
												<option value="">(selecciona)</option>
												{#each data.divisiones as dv (dv.id)}
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
												<select name="gradoPrefijo" bind:value={gradoPrefijo}>
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
										<input class="input" name="nombreProf" bind:value={nombreProf} />
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
										<input class="input" name="apePatProf" bind:value={apePatProf} />
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
										<input class="input" name="apeMatProf" bind:value={apeMatProf} />
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
											bind:value={correoProf}
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
											bind:value={areaConProf}
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
											bind:value={gradoEspecialidad}
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
											bind:value={contratoProf}
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
											bind:value={cateProf}
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
									<button class="button is-light" type="button" on:click={closeForm}
										>Cancelar</button
									>
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
							<th>División</th>
							<th>Correo</th>
							<th>Grado</th>
							<th>Estado</th>
						</tr>
					</thead>

					<tbody>
						{#if data.docentes.length === 0}
							<tr>
								<td colspan="6" class="has-text-centered">Sin resultados</td>
							</tr>
						{:else}
							{#each data.docentes as row (row.id)}
								<tr
									class={row.id === selectedId ? 'is-selected' : ''}
									on:click={() => selectRow(row)}
									style="cursor:pointer"
								>
									<td><strong>{row.cveProf}</strong></td>
									<td>{fullName(row)}</td>
									<td>{row.division?.descripcion ?? row.division?.clave ?? '-'}</td>
									<td>{row.correoProf ?? '-'}</td>
									<td>{row.gradoEspecialidad ?? '-'}</td>
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
