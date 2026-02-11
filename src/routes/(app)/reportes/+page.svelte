<script lang="ts">
    import FiltrosReportes from '$lib/components/filtros/filtrosReportes.svelte'; 
    import TablaReportes from '$lib/components/filtros/TablaReportes.svelte'; 

    let resultados = [];
    let cargando = false;

    async function buscarComisiones(event) {
        const filtros = event.detail; 
        cargando = true;

        try {
            const query = new URLSearchParams();
            Object.entries(filtros).forEach(([key, value]) => {
                if (value) query.append(key, value.toString());
            });

            const response = await fetch(`/api/reportes-comisiones?${query.toString()}`);
            resultados = await response.json();
        } catch (e) {
            console.error("Error buscando:", e);
        } finally {
            cargando = false;
        }
    }
</script>

<section class="section">
    <div class="container is-max-desktop"> 
        <h1 class="title has-text-white mb-5">Reporte de Comisiones</h1>
        
        <div class="mb-5">
            <FiltrosReportes on:filter={buscarComisiones} />
        </div>

        <div class="mt-5">
            {#if cargando}
                <div class="box">
                    <p class="has-text-centered mb-2 is-size-7">Buscando comisiones...</p>
                    <progress class="progress is-small is-primary" max="100">Cargando</progress>
                </div>
            {:else}
                <div class="table-wrapper">
                    <TablaReportes {resultados} />
                </div>
            {/if}
        </div>
    </div>
</section>

<style>
    .title {
        border-left: 5px solid #ffd124; 
        padding-left: 15px;
    }
</style>