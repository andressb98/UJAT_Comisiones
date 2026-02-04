<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import FormAlert from '$lib/components/forms/FormAlert.svelte';
	import { buildEnhanceHandler, type EnhanceFailState } from '$lib/utils/forms/actionFail';
	import { hasPermiso } from '$lib/utils/permisos';
	import { invalidateAll } from '$app/navigation';
	import flatpickr from 'flatpickr';
	import 'flatpickr/dist/flatpickr.css';
	import { Spanish } from 'flatpickr/dist/l10n/es.js';
	import { page } from '$app/stores';
	import { generarPdfComision } from '$lib/utils/comisiones/pdfGenerator';

	export let data: {
		comisiones: any[];
		docentes: any[];
		tiposComision: any[];
		lugares: any[];
		q: string;
		permisos: string[];
		divisionId: number;
		unidadId: number;
	};

	// Estado de selección
	let selectedId: number | null = null;
	$: selected = data.comisiones.find((x) => x.id === selectedId) ?? null;

	// constantes del usuario
	$: usuario = $page.data.usuario;

	// Estado de la vista
	let showForm = false;
	let mode: 'create' | 'edit' = 'create'; // Para futuro soporte de edición

	// Estado del formulario
	let folio = '';
	let docenteId: number | null = null;
	let tipoComisionId: number | null = null;
	let lugarId: number | null = null;
	let fechaInicio = '';
	let fechaFin = '';
	let horaInicio = '';
	let horaFin = '';
	let comentarios = '';

	let q = data.q;

	let docentes = data.docentes;
	let tiposComision = data.tiposComision;
	let lugares = data.lugares;

	// Mensajes de errores
	let formMessage: string | null = null;
	let formErrors: string[] = [];
	let fieldErrors: Record<string, string[] | undefined> = {};

	// Estados para los modales
	let showModalTipo = false;
	let showModalLugar = false;

	// Inputs para los modales
	let newTipoNombre = '';
	let newTipoDesc = '';
	let newLugarDesc = '';

	// Referencias a los inputs
	let inputTipoNombre;
	let inputTipo;
	let inputLugar;
	let inputFechaInicio;
	let inputFechaFin;
	let inputHoraInicio;
	let inputHoraFin;

	// filtro para la tabla
	let filters = {
		clave: '',
		docente: '',
		tipo: '',
		lugar: '',
		estado: '',
		fechaInicio: '',
		fechaFin: ''
	};

	const openEdit = () => {
		if (!selected) return;
		mode = 'edit';

		// Asignar IDs
		docenteId = selected.docentesComision[0].docente.id;
		tipoComisionId = selected.tipoComision.id;
		lugarId = selected.lugar.id;

		// ¡IMPORTANTE! Asignar los textos de búsqueda para que el usuario los vea
		searchDocente = `${selected.docentesComision[0].docente.nombreProf} ${selected.docentesComision[0].docente.apePatProf}`;
		searchTipo = selected.tipoComision.nombre;
		searchLugar = selected.lugar.descripcion;

		// Fechas y otros
		fechaInicio = new Date(selected.fechaInicio).toISOString().split('T')[0];
		fechaFin = selected.fechaFin ? new Date(selected.fechaFin).toISOString().split('T')[0] : '';
		horaInicio = selected.horaInicio;
		horaFin = selected.horaFin;
		comentarios = selected.comentarios || '';

		showForm = true;
	};

	// Funciones de control de UI
	const openCreate = () => {
		mode = 'create';
		resetForm();
		showForm = true;
	};

	const closeForm = () => {
		showForm = false;
		resetForm();
	};

	const resetForm = () => {
		folio = '';
		docenteId = null;
		tipoComisionId = null;
		fechaInicio = '';
		fechaFin = '';
		horaInicio = '';
		horaFin = '';
		lugarId = null;
		comentarios = '';
		formMessage = null;
		formErrors = [];
		fieldErrors = {};
	};

	let activeDropdown = '';

	// Variables para el filtrado (Search terms)
	let searchDocente = '';
	let searchTipo = '';
	let searchLugar = '';

	// Listas filtradas reactivas
	$: filteredDocentes = docentes.filter((d) =>
		`${d.nombreProf} ${d.apePatProf}`.toLowerCase().includes(searchDocente.toLowerCase())
	);

	$: filteredTipos = tiposComision.filter((t) =>
		t.nombre.toLowerCase().includes(searchTipo.toLowerCase())
	);

	$: filteredLugares = lugares.filter((l) =>
		l.descripcion.toLowerCase().includes(searchLugar.toLowerCase())
	);

	// sincronizar las listas cuando se agrega una nueva opcion
	$: tiposComision = data.tiposComision;
	$: lugares = data.lugares;

	// Lógica de filtrado reactiva para la tabla
	$: comisionesFiltradas = data.comisiones.filter((c) => {
		const clave = (c.claveComision || '').toLowerCase();
		const docente = c.docentesComision?.[0]?.docente;
		const nombreDocente = `${docente?.nombreProf} ${docente?.apePatProf}`.toLowerCase();
		const tipoNom = (c.tipoComision?.nombre || '').toLowerCase();
		const lugarDesc = (c.lugar?.descripcion || '').toLowerCase();
		const estadoNom = (c.estadoCalculado || 'PENDIENTE').toLowerCase();

		// Filtros de texto
		const matchDocente = nombreDocente.includes(filters.docente.toLowerCase());
		const matchTipo = tipoNom.includes(filters.tipo.toLowerCase());
		const matchLugar = lugarDesc.includes(filters.lugar.toLowerCase());
		const matchEstado = estadoNom.includes(filters.estado.toLowerCase());

		// Filtro de rango de fechas
		const fComision = new Date(c.fechaInicio).getTime();
		const fDesde = filters.fechaInicio ? new Date(filters.fechaInicio).getTime() : null;
		const fHasta = filters.fechaFin ? new Date(filters.fechaFin).getTime() : null;

		let matchFecha = true;
		if (fDesde && fHasta) {
			matchFecha = fComision >= fDesde && fComision <= fHasta;
		} else if (fDesde) {
			matchFecha = fComision >= fDesde;
		} else if (fHasta) {
			matchFecha = fComision <= fHasta;
		}

		return matchDocente && matchTipo && matchLugar && matchEstado && matchFecha;
	});

	$: if (docenteId && fechaInicio && fechasOcupadasDocente.includes(fechaInicio)) {
		toast.error('La fecha seleccionada está dentro de un periodo ocupado para este docente');
		fechaInicio = '';
		fechaFin = '';
	}

	// fechas ocupadas por el docente seleccionado

	$: fechasOcupadasDocente = data.comisiones
		.filter(
			(c) => c.docentesComision.some((dc) => dc.docente.id === docenteId) && c.id !== selectedId
		)
		.flatMap((c) => {
			// Función interna para normalizar a string YYYY-MM-DD sin desfase UTC
			const toLocalISO = (dateVal) => {
				const d = new Date(dateVal);
				if (isNaN(d.getTime())) return null;
				const y = d.getFullYear();
				const m = String(d.getMonth() + 1).padStart(2, '0');
				const day = String(d.getDate()).padStart(2, '0');
				return `${y}-${m}-${day}`;
			};

			const inicio = toLocalISO(c.fechaInicio);
			const fin = c.fechaFin ? toLocalISO(c.fechaFin) : inicio;

			if (!inicio) return [];
			return getDaysArray(inicio, fin);
		});

	// Validaciones
	const validateDatesAndTimes = () => {
		formErrors = [];
		if (fechaInicio && new Date(fechaInicio) < new Date(new Date().setHours(0, 0, 0, 0))) {
			formErrors.push('La fecha de inicio no puede ser anterior al día de hoy.');
			return false;
		}
		if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
			formErrors.push('La fecha de fin no puede ser antes de la fecha de inicio.');
			return false;
		}
		if (fechaInicio === fechaFin && horaInicio && horaFin && horaFin < horaInicio) {
			formErrors.push('La hora de fin no puede ser antes de la hora de inicio (mismo día).');
			return false;
		}
		return true;
	};

	// Manejo del submit
	const handleSubmit = buildEnhanceHandler({
		clear: () => {
			formMessage = null;
			formErrors = [];
			fieldErrors = {};
		},
		onSuccess: async (result) => {
			if (result.type === 'success' && result.data?.ok) {
				const comisionCreada = result.data.comision;

				toast.success(mode === 'create' ? 'Comisión registrada' : 'Actualizada');

				if (comisionCreada) {
					await generarPdfComision(comisionCreada.id);
				}

				await invalidateAll();
				closeForm();
			}
		},
		onFailure: (state: EnhanceFailState) => {
			formMessage = state.message;
			formErrors = state.formErrors;
			fieldErrors = state.fieldErrors;
		}
	});

	// Helpers de error visual
	const hasFieldError = (errors: Record<string, string[] | undefined>, field: string) =>
		errors[field]?.length;
	const firstFieldError = (errors: Record<string, string[] | undefined>, field: string) =>
		errors[field]?.[0];

	// Helpers para seleccionar
	function selectDocente(id, nombre) {
		docenteId = id;
		searchDocente = nombre;
		activeDropdown = '';
	}

	function selectTipo(id, nombre) {
		tipoComisionId = id;
		searchTipo = nombre;
		activeDropdown = '';
	}

	function selectLugar(id, nombre) {
		lugarId = id;
		searchLugar = nombre;
		activeDropdown = '';
	}

	function closeAll() {
		setTimeout(() => (activeDropdown = ''), 200);
	}

	// Manejo de creación rápida desde modales
	async function handleQuickCreate(result: any, type: 'tipo' | 'lugar') {
		if (result.type === 'success' && result.data?.nuevo) {
			const item = result.data.nuevo;
			if (type === 'tipo') {
				selectTipo(item.id, item.nombre);
				showModalTipo = false;
				newTipoNombre = '';
				newTipoDesc = '';
			} else {
				selectLugar(item.id, item.descripcion);
				showModalLugar = false;
				newLugarDesc = '';
			}
			toast.success('Registrado correctamente');
		}
	}

	// Función para obtener todos los días entre un rango
	function getDaysArray(startStr, endStr) {
		let arr = [];
		let current = new Date(startStr + 'T00:00:00'); // Forzamos hora local 00:00
		let end = new Date(endStr + 'T00:00:00');

		while (current <= end) {
			// Formateamos manualmente a YYYY-MM-DD
			const y = current.getFullYear();
			const m = String(current.getMonth() + 1).padStart(2, '0');
			const d = String(current.getDate()).padStart(2, '0');
			arr.push(`${y}-${m}-${d}`);

			current.setDate(current.getDate() + 1);
		}
		return arr;
	}
	function setupPicker(node, params: { isEnd?: boolean; disabledDates?: string[] }) {
		const { isEnd = false, disabledDates = [] } = params;

		const instance = flatpickr(node, {
			locale: Spanish,
			dateFormat: 'Y-m-d',
			disable: disabledDates,
			minDate: isEnd ? fechaInicio : 'today',
			onChange: (selectedDates, dateStr) => {
				if (isEnd) fechaFin = dateStr;
				else fechaInicio = dateStr;
			}
		});

		return {
			update(newParams) {
				// Actualizar fechas deshabilitadas cuando cambien
				if (newParams.disabledDates) {
					instance.set('disable', newParams.disabledDates);
				}
				// Actualizar minDate si es fecha fin y cambió la fecha inicio
				if (isEnd && newParams.isEnd) {
					instance.set('minDate', fechaInicio);
				}
			},
			destroy() {
				instance.destroy();
			}
		};
	}

	// Limpiar fechas si el docente cambia y la fecha seleccionada está ocupada
	$: if (docenteId && fechaInicio && fechasOcupadasDocente.includes(fechaInicio)) {
		toast.error('La fecha seleccionada ya no está disponible para este docente');
		fechaInicio = '';
		fechaFin = '';
	}
</script>

<section class="section">
	<div class="container">
		<div class="level">
			<div class="level-left">
				<h1 class="title is-4">Gestión de Comisiones</h1>
			</div>
		</div>

		{#if !showForm}
			<div class="box">
				<form method="GET">
					<div class="columns is-vcentered is-multiline">
						<div class="column is-6">
							<div class="field">
								<p class="control is-expanded">
									<input
										class="input"
										name="q"
										type="text"
										placeholder="Buscar comisión..."
										bind:value={q}
									/>
								</p>
							</div>
						</div>
						<div class="column is-narrow">
							<button class="button is-info" type="submit">Buscar</button>
						</div>
					</div>
				</form>
				<div class="is-flex is-justify-content-flex-end gap-2">
					{#if hasPermiso(data.permisos, 'COMISIONES_CREAR')}
						<button class="button is-primary" type="button" on:click={openCreate}>
							Registrar Comisión
						</button>
						<button class="button is-light" type="button" on:click={openEdit} disabled={!selected}>
							Editar Comisión</button
						>
					{/if}
				</div>
			</div>
		{/if}

		{#if showForm}
			<div class="box" style="margin-top: 1rem;">
				<div class="level">
					<div class="level-left">
						<h2 class="title is-5">
							{mode === 'create' ? 'Registrar nueva comisión' : 'Editar comisión'}
						</h2>
					</div>
					<div class="level-right">
						<button class="button is-light is-small" type="button" on:click={closeForm}>
							<span class="icon is-small"><i class="fas fa-times"></i></span> <span>Cerrar</span>
						</button>
					</div>
				</div>

				<hr style="margin: 0.5rem 0 1.5rem 0;" />

				<form
					method="POST"
					action={mode === 'create' ? '?/create' : '?/update'}
					use:enhance={handleSubmit}
				>
					<input type="hidden" name="divisionId" value={$page.data.division.id} />
					<input type="hidden" name="unidadId" value={$page.data.unidad.id} />
					{#if mode === 'edit'}
						<input type="hidden" name="id" value={selectedId} />
					{/if}
					<FormAlert message={formMessage} {formErrors} variant="danger" />
					<div class="columns is-multiline">
						<div class="column is-3">
							<div class="field">
								<label class="label">Folio</label>
								<div class="control has-icons-left">
									<input
										class="input {hasFieldError(fieldErrors, 'folio') ? 'is-danger' : ''}"
										type="text"
										name="folio"
										placeholder="Ej: FAC-2024-001"
										bind:value={folio}
									/>
									<span class="icon is-small is-left">
										<i class="fas fa-hashtag"></i>
									</span>
								</div>
								{#if firstFieldError(fieldErrors, 'folio')}
									<p class="help is-danger">{firstFieldError(fieldErrors, 'folio')}</p>
								{/if}
							</div>
						</div>
						<div class="column is-3">
							<div class="field">
								<label class="label">Docente</label>
								<div class="control">
									<input type="hidden" name="docenteId" value={docenteId} />

									<div
										class="dropdown is-fullwidth {activeDropdown === 'docente' ? 'is-active' : ''}"
									>
										<div class="dropdown-trigger">
											<input
												class="input {hasFieldError(fieldErrors, 'docenteId') ? 'is-danger' : ''}"
												type="text"
												placeholder="Seleccione un docente..."
												bind:value={searchDocente}
												disabled={mode === 'edit'}
												on:focus={() => {
													if (mode === 'create') {
														activeDropdown = 'docente';
														searchDocente = '';
														docenteId = null;
													}
												}}
											/>
											{#if docenteId && fechasOcupadasDocente.length > 0}
												<div class="notification is-warning is-light is-narrow p-2 mt-2">
													<p class="is-size-7">
														<span class="icon is-small"><i class="fas fa-calendar-times"></i></span>
														<strong>Días ocupados:</strong>
														{fechasOcupadasDocente.join(', ')}
													</p>
												</div>
											{/if}
										</div>

										{#if mode === 'create'}
											<div
												class="dropdown-menu"
												style="width: 100%; max-height: 200px; overflow-y: auto;"
											>
												<div class="dropdown-content">
													{#each filteredDocentes as d}
														<button
															type="button"
															class="dropdown-item is-button w-100"
															on:click={() =>
																selectDocente(d.id, `${d.nombreProf} ${d.apePatProf}`)}
														>
															{d.nombreProf}
															{d.apePatProf}
														</button>
													{:else}
														<div class="dropdown-item has-text-grey">No hay resultados</div>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								</div>
								{#if firstFieldError(fieldErrors, 'docenteId')}
									<p class="help is-danger">{firstFieldError(fieldErrors, 'docenteId')}</p>
								{/if}
							</div>
						</div>

						<div class="column is-3">
							<div class="field">
								<label class="label">Tipo de Comisión</label>
								<div class="control">
									<input type="hidden" name="tipoComisionId" value={tipoComisionId} />
									<div class="dropdown is-fullwidth {activeDropdown === 'tipo' ? 'is-active' : ''}">
										<div class="dropdown-trigger">
											<input
												class="input {hasFieldError(fieldErrors, 'tipoComisionId')
													? 'is-danger'
													: ''}"
												type="text"
												placeholder="Seleccione tipo..."
												bind:value={searchTipo}
												on:focus={() => (activeDropdown = 'tipo')}
												on:input={() => (tipoComisionId = null)}
											/>
										</div>
										<div class="dropdown-menu" style="width: 100%;">
											<div class="dropdown-content">
												{#each filteredTipos as tipo}
													<button
														type="button"
														class="dropdown-item is-button w-100"
														on:click={() => selectTipo(tipo.id, tipo.nombre)}
													>
														{tipo.nombre}
													</button>
												{:else}
													<div class="dropdown-item has-text-grey">Sin coincidencias</div>
												{/each}
												<hr class="dropdown-divider" />
												<button
													type="button"
													class="dropdown-item has-text-primary has-text-weight-bold"
													on:mousedown={() => (showModalTipo = true)}
												>
													<span class="icon"><i class="fas fa-plus-circle"></i></span> Agregar nuevo tipo
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="column is-3">
							<div class="field">
								<label class="label">Lugar</label>
								<div class="control">
									<input type="hidden" name="lugarId" value={lugarId} />
									<div
										class="dropdown is-fullwidth {activeDropdown === 'lugar' ? 'is-active' : ''}"
									>
										<div class="dropdown-trigger">
											<input
												class="input {hasFieldError(fieldErrors, 'lugarId') ? 'is-danger' : ''}"
												type="text"
												placeholder="Escriba lugar..."
												bind:value={searchLugar}
												on:focus={() => (activeDropdown = 'lugar')}
												on:input={() => (lugarId = null)}
											/>
										</div>
										<div class="dropdown-menu" style="width: 100%;">
											<div class="dropdown-content">
												{#each filteredLugares as l}
													<button
														type="button"
														class="dropdown-item is-button w-100"
														on:click={() => selectLugar(l.id, l.descripcion)}
													>
														{l.descripcion}
													</button>
												{:else}
													<div class="dropdown-item has-text-grey">No se encontró el lugar</div>
												{/each}
												<hr class="dropdown-divider" />
												<button
													type="button"
													class="dropdown-item has-text-primary has-text-weight-bold"
													on:mousedown={() => (showModalLugar = true)}
												>
													<span class="icon"><i class="fas fa-plus-circle"></i></span> Agregar nuevo lugar
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="column is-12">
							<div class="columns">
								<div class="column is-3">
									<div class="field">
										<label class="label is-small">Fecha Inicio</label>
										<div class="control">
											<input
												name="fechaInicio"
												class="input {hasFieldError(fieldErrors, 'fechaInicio') ? 'is-danger' : ''}"
												placeholder="Seleccione fecha..."
												use:setupPicker={{ isEnd: false, disabledDates: fechasOcupadasDocente }}
												bind:value={fechaInicio}
												readonly
											/>
										</div>
									</div>
								</div>

								<div class="column is-3">
									<div class="field">
										<label class="label is-small">Hora Inicio</label>
										<div class="control">
											<input class="input" type="time" name="horaInicio" bind:value={horaInicio} />
										</div>
									</div>
								</div>

								<div class="column is-3">
									<div class="field">
										<label class="label is-small">Fecha Fin</label>
										<div class="control">
											<input
												name="fechaFin"
												class="input {hasFieldError(fieldErrors, 'fechaFin') ? 'is-danger' : ''}"
												placeholder="Seleccione fecha..."
												use:setupPicker={{ isEnd: true, disabledDates: fechasOcupadasDocente }}
												bind:value={fechaFin}
												readonly
											/>
										</div>
									</div>
								</div>

								<div class="column is-3">
									<div class="field">
										<label class="label is-small">Hora Fin</label>
										<div class="control">
											<input class="input" type="time" name="horaFin" bind:value={horaFin} />
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="column is-12">
							<div class="field">
								<label class="label">Comentarios</label>
								<div class="control">
									<textarea class="textarea" name="comentarios" bind:value={comentarios} rows="3"
									></textarea>
								</div>
							</div>
						</div>

						<div class="column is-12">
							<div class="is-flex is-justify-content-flex-end" style="gap: 0.5rem;">
								<button
									class="button is-primary"
									type="submit"
									on:click|capture={validateDatesAndTimes}
								>
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

		<div class="box">
			<div class="table-container">
				<table class="table is-fullwidth is-hoverable is-narrow">
					<thead>
						<tr>
							<th>Clave</th>
							<th>Docente</th>
							<th>Tipo</th>
							<th style="min-width: 250px;">Rango de Fechas</th>
							<th>Lugar</th>
							<th>Estado</th>
						</tr>
						<tr class="has-background-light">
							<td>
								<!-- Filtro vacío para clave -->
								<input
									class="input is-small"
									type="text"
									placeholder="Filtrar clave..."
									bind:value={filters.clave}
								/>
							</td>
							<td>
								<input
									class="input is-small"
									type="text"
									placeholder="Filtrar docente..."
									bind:value={filters.docente}
								/>
							</td>
							<td>
								<input
									class="input is-small"
									type="text"
									placeholder="Filtrar tipo..."
									bind:value={filters.tipo}
								/>
							</td>
							<td>
								<div class="field is-grouped">
									<input class="input is-small" type="date" bind:value={filters.fechaInicio} />
									<span class="mx-1">-</span>
									<input class="input is-small" type="date" bind:value={filters.fechaFin} />
								</div>
							</td>
							<td>
								<input
									class="input is-small"
									type="text"
									placeholder="Filtrar lugar..."
									bind:value={filters.lugar}
								/>
							</td>
							<td>
								<div class="select is-small is-fullwidth">
									<select bind:value={filters.estado}>
										<option value="">TODOS</option>
										<option value="PENDIENTE">PENDIENTE</option>
										<option value="FINALIZADA">FINALIZADA</option>
										<option value="EN_PROCESO">EN_PROCESO</option>
									</select>
								</div>
							</td>
						</tr>
					</thead>
					<tbody>
						{#each comisionesFiltradas as comision}
							<tr
								class={selected && selected.id === comision.id ? 'has-background-link-light' : ''}
								on:click={() => (selectedId = comision.id)}
								style="cursor: pointer;"
							>
								<td>{comision.claveComision || 'N/A'}</td>
								<td>
									{#if comision.docentesComision?.length > 0}
										{@const d = comision.docentesComision[0].docente}
										{d.nombreProf}
										{d.apePatProf}
									{:else}
										<span class="has-text-grey-light">Sin docente asignado</span>
									{/if}
								</td>
								<td>{comision.tipoComision?.nombre}</td>
								<td>
									{new Date(comision.fechaInicio).toLocaleDateString()}
									{#if comision.fechaFin}
										- {new Date(comision.fechaFin).toLocaleDateString()}
									{/if}
								</td>
								<td>{comision.lugar?.descripcion}</td>
								<td>
									<span
										class="badge {comision.estadoCalculado === 'FINALIZADA'
											? 'bg-red'
											: 'bg-green'}"
									>
										{comision.estadoCalculado}
									</span>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="5" class="has-text-centered has-text-grey py-5">
									No hay resultados que coincidan con los filtros.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>

<div class="modal {showModalTipo ? 'is-active' : ''}">
	<div class="modal-background" on:click={() => (showModalTipo = false)}></div>
	<div class="modal-card">
		<header class="modal-card-head">
			<p class="modal-card-title">Nuevo Tipo de Comisión</p>
		</header>
		<form
			method="POST"
			action="?/createTipoComision"
			use:enhance={() =>
				({ result }) =>
					handleQuickCreate(result, 'tipo')}
		>
			<section class="modal-card-body">
				<div class="field">
					<label class="label">Nombre</label>
					<input class="input" name="nombre" bind:value={newTipoNombre} required />
				</div>
				<div class="field">
					<label class="label">Descripción</label>
					<input class="input" name="descripcion" bind:value={newTipoDesc} />
				</div>
			</section>
			<footer class="modal-card-foot">
				<button class="button is-success" type="submit">Guardar</button>
				<button class="button" type="button" on:click={() => (showModalTipo = false)}
					>Cancelar</button
				>
			</footer>
		</form>
	</div>
</div>

<div class="modal {showModalLugar ? 'is-active' : ''}">
	<div class="modal-background" on:click={() => (showModalLugar = false)}></div>
	<div class="modal-card">
		<header class="modal-card-head">
			<p class="modal-card-title">Nuevo Lugar</p>
		</header>
		<form
			method="POST"
			action="?/createLugar"
			use:enhance={() =>
				({ result }) =>
					handleQuickCreate(result, 'lugar')}
		>
			<section class="modal-card-body">
				<div class="field">
					<label class="label">Descripción / Nombre del Lugar</label>
					<input class="input" name="descripcion" bind:value={newLugarDesc} required />
				</div>
			</section>
			<footer class="modal-card-foot">
				<button class="button is-success" type="submit">Guardar</button>
				<button class="button" type="button" on:click={() => (showModalLugar = false)}
					>Cancelar</button
				>
			</footer>
		</form>
	</div>
</div>
