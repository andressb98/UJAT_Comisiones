<script lang="ts">
  import { onMount } from "svelte";
  import TopNav from "$lib/components/layout/TopNav.svelte";
  import Sidebar from "$lib/components/layout/Sidebar.svelte";
  import { recomputeMenu } from "$lib/stores/menuStore";

  export let data: any;

  onMount(() => {
    recomputeMenu(data?.permisos ?? []);
  });
</script>

{#if data?.user}
  <TopNav />

  <div class="app-shell">
    <Sidebar />
    <main class="content-main">
      <slot />
    </main>
  </div>
{:else}
  <main class="content-main full-width">
    <slot />
  </main>
{/if}
