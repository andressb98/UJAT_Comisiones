<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { selectedCategory, recomputeMenu } from '$lib/stores/menuStore';

	$: user = $page.data.user;
	$: permisos = ($page.data.permisos ?? []) as string[];

	$: iniciales = user?.nombre
		? user.nombre
				.split(' ')
				.filter(Boolean)
				.map((n: string) => n[0])
				.slice(0, 2)
				.join('')
				.toUpperCase()
		: '??';

	function setCategory(cat: 'catalogo' | 'registro' | 'configuracion') {
		selectedCategory.set(cat);
		recomputeMenu(permisos);
	}

	async function handleLogout() {
		await fetch('/logout', { method: 'POST' });
		selectedCategory.set('catalogo');
		recomputeMenu([]);
        goto('/login');
	}
</script>

<nav class="navbar">
	<div class="navbar-start">
		<a class="navbar-item" on:click={() => setCategory('catalogo')}>Catálogo</a>
		<a class="navbar-item" on:click={() => setCategory('registro')}>Registro</a>
		<a class="navbar-item" on:click={() => setCategory('configuracion')}>Configuración</a>
	</div>

	<div class="navbar-end">
		{#if user}
			<div class="profile-container" aria-label="Perfil de usuario">
				<div class="avatar-circle" title={user.nombre}>
					{iniciales}
				</div>

				<div class="profile-dropdown">
					<div class="dropdown-header">
						<strong>{user.nombre}</strong>
						{#if user?.rol}
							<span class="role-badge">{user.rol}</span>
						{/if}
					</div>

					<div class="dropdown-body">
						<p class="token-info">Email: {user.correo}</p>

						{#if $page.data.division}
							<p class="token-info">División: {$page.data.division.descripcion}</p>
						{/if}

						{#if $page.data.unidad}
							<p class="token-info">Unidad: {$page.data.unidad.descripcion}</p>
						{/if}

						<hr />
						<button class="logout-btn" on:click={handleLogout}>Cerrar Sesión</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</nav>

<style>
	/* Mantengo tu estilo base, solo lo hago un poquito más "clean" */

	.navbar {
		background: var(--color-secundario);
		padding: 0.75rem 1rem;
	}

	.navbar-start {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.navbar-item {
		cursor: pointer;
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
	}
	.navbar-item:hover {
		opacity: 0.9;
	}

	.navbar-end {
		display: flex;
		align-items: center;
	}

	.profile-container {
		position: relative;
		padding: 6px 0;
		cursor: pointer;
	}

	.avatar-circle {
		width: 40px;
		height: 40px;
		background-color: white;
		color: var(--color-secundario, #333);
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: 700;
		font-size: 1.05rem;
		border: 2px solid rgba(255, 255, 255, 0.2);
		user-select: none;
	}

	.profile-dropdown {
		display: none;
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: white;
		color: #333;
		min-width: 270px;
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		z-index: 100;
		animation: fadeIn 0.16s ease-in-out;
	}

	.profile-container:hover .profile-dropdown {
		display: block;
	}

	.dropdown-header {
		background: #f5f5f5;
		padding: 0.9rem 1rem;
		border-bottom: 1px solid #eee;
	}

	.dropdown-header strong {
		display: block;
		font-size: 1rem;
		line-height: 1.2;
	}

	.role-badge {
		display: inline-block;
		margin-top: 6px;
		background: #e0e0e0;
		font-size: 0.72rem;
		padding: 2px 8px;
		border-radius: 999px;
		text-transform: uppercase;
		font-weight: 800;
		color: #555;
	}

	.dropdown-body {
		padding: 0.9rem 1rem 1rem;
	}

	.token-info {
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 0.4rem;
	}

	hr {
		border: 0;
		border-top: 1px solid #eee;
		margin: 0.65rem 0;
	}

	.logout-btn {
		width: 100%;
		padding: 0.55rem;
		background: #ff3860;
		color: white;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		font-weight: 800;
	}

	.logout-btn:hover {
		background: #ff1443;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
