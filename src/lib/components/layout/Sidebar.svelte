<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	import { activeMenuItems } from '$lib/stores/menuStore';
	import { recomputeMenu } from '$lib/stores/menuStore'; // Asegúrate de importar recomputeMenu
	import type { MenuItem } from '$lib/config/menuConfig';

	let menuItems: MenuItem[] = [];
	let activeRoute = '';

	// Suscripción a los elementos activos del menú
	const unsub = activeMenuItems.subscribe((items) => (menuItems = items));

	// Reactividad en función de la ruta activa
	$: activeRoute = $page.url.pathname;

	// Reactividad en función de los permisos del usuario
	$: permisos = ($page.data.permisos ?? []) as string[];
	$: recomputeMenu(permisos); // Llama a recomputeMenu para recalcular el menú basado en los permisos

	function navigateTo(route: string) {
		goto(route);
	}

	// Limpieza de la suscripción cuando el componente se destruya
	onDestroy(() => unsub());
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<h2 class="sidebar-title">Menú</h2>
	</div>

	<ul class="sidebar-menu">
		{#each menuItems as item (item.route)}
			{#if !item.permiso || permisos.includes(item.permiso)}
				<!-- Solo muestra si tiene permiso o si no tiene permiso asignado -->
				<li>
					<button
						class="sidebar-item {activeRoute === item.route ? 'is-active' : ''}"
						on:click={() => navigateTo(item.route)}
						type="button"
					>
						<span class="sidebar-text">{item.label}</span>
					</button>
				</li>
			{/if}
		{/each}
	</ul>
</aside>

<style>
	/* Tu layout.scss ya define .sidebar general.
     Aquí solo pongo lo mínimo que ocupa el componente (sin cambiar colores). */

	.sidebar-header {
		margin-bottom: 1.25rem;
		padding: 0 0.5rem;
	}

	.sidebar-title {
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.3px;
	}

	.sidebar-menu {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.sidebar-item {
		width: 100%;
		text-align: left;
		background: transparent;
		border: none;
		display: flex;
		align-items: center;
		padding: 0.7rem 0.9rem;
		margin: 0.25rem 0.5rem;
		border-radius: 8px;
		cursor: pointer;
	}

	.sidebar-text {
		flex: 1;
		font-size: 0.95rem;
	}
</style>
