<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	import FormAlert from '$lib/components/forms/FormAlert.svelte';
	import { buildEnhanceHandler, type EnhanceFailState } from '$lib/utils/forms/actionFail';
	import { hasFieldError, firstFieldError } from '$lib/utils/forms/field';
	import { hasPermiso } from '$lib/utils/permisos';
	import { number } from 'zod';

	export let data: {
		usuarios: any[];
		divisiones: any[];
		q: string;
		permisos: string[];
		unidades: any[];
		roles: string[];
	};

	const permisos = data.permisos ?? [];

	let formMessage: string | null = null;
	let formErrors: string[] = [];
	let fieldErrors: Record<string, string[] | undefined> = {};

	let q = data.q ?? '';

	let selectedId: number | null = null;
	$: selected = data.usuarios.find((x) => x.id === selectedId) ?? null;

	let showForm = false;
	let mode: 'create' | 'edit' = 'create';

	let id: number | null = null;
	let nombre = '';
	let correo = '';
	let password = '';
	let unidadId: number | null = null;
	let rolesId: number | null = null;

	const handleUsuarioSubmit = buildEnhanceHandler({
		clear: () => {
			formMessage = null;
			formErrors = [];
			fieldErrors = {};
		},
		onSuccess: async () => {
			unidadId = Number(unidadId);
			rolesId = Number(rolesId);
			id = Number(id);
			showForm = false;
			toast.success(
				mode === 'create'
					? 'El usuario se agregó correctamente'
					: 'El usuario se actualizó correctamente'
			);
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
		correo = '';
		password = '';
		unidadId = null;
		rolesId = null;
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
		correo = selected.correo ?? '';
		unidadId = selected.coordinador?.unidadId ?? null; // Obtiene la unidad administrativa
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
				<h1 class="title is-4">Usuarios</h1>
			</div>

			{#if selected}
				<div class="level-right">
					<span class="tag is-light">
						Seleccionado:
						<strong style="margin-left:.5rem">{selected.nombre}</strong>
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
							<label class="label">Buscar por nombre o correo</label>
							<div class="control">
								<input
									class="input"
									name="q"
									placeholder="Ej: Juan Pérez, juan.perez@example.com"
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
				{#if hasPermiso(permisos, 'USUARIOS_CREAR')}
					<button class="button is-primary" type="button" on:click={openCreate}>Agregar</button>
				{/if}

				{#if hasPermiso(permisos, 'USUARIO_EDITAR')}
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
							<h2 class="title is-5">{mode === 'create' ? 'Agregar usuario' : 'Editar usuario'}</h2>
						</div>
						<div class="level-right">
							<button class="button is-light" type="button" on:click={closeForm}>Cerrar</button>
						</div>
					</div>

					<form
						method="POST"
						action={mode === 'create' ? '?/create' : '?/update'}
						use:enhance={handleUsuarioSubmit}
					>
						<FormAlert message={formMessage} {formErrors} variant="danger" />

						{#if mode === 'edit'}
							<input type="hidden" name="id" value={id ?? ''} />
						{/if}

						<div class="columns is-multiline">
							<!-- Tipo de usuario -->
							<div class="column is-4">
								<div class="field">
									<label class="label">Tipo de usuario</label>
									<div class="control">
										<div class="select">
											<select bind:value={rolesId} name="rolesId" required>
												<option value="" disabled>Selecciona un rol</option>
												{#each data.roles as rol}
													<option value={rol}>{rol}</option>
												{/each}
											</select>
										</div>
									</div>
								</div>
							</div>

							<!-- Nombre -->
							<div class="column is-4">
								<div class="field">
									<label class="label">Nombre</label>
									<div class="control">
										<input
											class="input {hasFieldError(fieldErrors, 'nombre') ? 'is-danger' : ''}"
											name="nombre"
											bind:value={nombre}
											required
											placeholder="Ej: Juan Pérez"
										/>
									</div>

									{#if firstFieldError(fieldErrors, 'nombre')}
										<p class="help is-danger">{firstFieldError(fieldErrors, 'nombre')}</p>
									{/if}
								</div>
							</div>

							<!-- Correo -->
							<div class="column is-4">
								<div class="field">
									<label class="label">Correo</label>
									<div class="control">
										<input
											class="input {hasFieldError(fieldErrors, 'correo') ? 'is-danger' : ''}"
											name="correo"
											bind:value={correo}
											required
											placeholder="Ej: juan.perez@example.com"
										/>
									</div>

									{#if firstFieldError(fieldErrors, 'correo')}
										<p class="help is-danger">{firstFieldError(fieldErrors, 'correo')}</p>
									{/if}
								</div>
							</div>

							<!-- Contraseña -->
							<div class="column is-6">
								<div class="field">
									<label class="label">Contraseña</label>
									<div class="control">
										<input
											class="input {hasFieldError(fieldErrors, 'password') ? 'is-danger' : ''}"
											name="password"
											bind:value={password}
											required
											type="password"
											placeholder="******"
										/>
									</div>

									{#if firstFieldError(fieldErrors, 'password')}
										<p class="help is-danger">{firstFieldError(fieldErrors, 'password')}</p>
									{/if}
								</div>
							</div>

							<!-- Unidad Administrativa -->
							<div class="column is-6">
								<div class="field">
									<label class="label">Unidad Administrativa</label>
									<div class="control">
										<div class="select">
											<select bind:value={unidadId} name="unidadId" required>
												<option value="">Selecciona una unidad</option>
												{#each data.unidades as unidad}
													<option value={unidad.id}>{unidad.siglas}</option>
												{/each}
											</select>
										</div>
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
							<th>Nombre</th>
							<th>Correo</th>
							<th>Unidad Administrativa</th>
							<th>División</th>
						</tr>
					</thead>

					<tbody>
						{#if data.usuarios.length === 0}
							<tr>
								<td colspan="4" class="has-text-centered">Sin resultados</td>
							</tr>
						{:else}
							{#each data.usuarios as row (row.id)}
								<tr
									class={row.id === selectedId ? 'is-selected' : ''}
									on:click={() => selectRow(row)}
									style="cursor:pointer"
								>
									<td><strong>{row.nombre}</strong></td>
									<td>{row.correo}</td>
									<td>{row.coordinador?.unidad?.siglas ?? '-'}</td>
									<td>{row.adminDivision?.division?.descripcion ?? '-'}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>
