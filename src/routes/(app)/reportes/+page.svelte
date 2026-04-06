<script lang="ts">
    import FiltrosReportes from '$lib/components/filtros/filtrosReportes.svelte';
    import TablaReportes from '$lib/components/filtros/TablaReportes.svelte';
    import BotonExportar from '$lib/components/botones/botonExportar.svelte';

    let resultados = [];
    let datosFormateados = []; // Nueva variable para el PDF/Excel
    let cargando = false;

    // Función para transformar los objetos complejos en texto plano
    function formatearResultados(data) {
        return data.map(item => ({
            'Clave': item.claveComision,
            'Folio': item.folio,
            'Tipo de Comisión': item.tipoComision?.nombre || 'N/A',
            'Fecha Inicio': new Date(item.fechaInicio).toLocaleDateString('es-MX'),
            'Fecha Fin': new Date(item.fechaFin).toLocaleDateString('es-MX'),
            'Horario': `${item.horaInicio} - ${item.horaFin}`,
            'Lugar': item.lugar?.descripcion || 'N/A',
            'Edificio': item.lugar?.edificio || '',
            'División': item.division?.descripcion || item.division?.siglas || 'N/A',
            'Unidad Administrativa': item.unidadAdministrativa?.descripcion || 'N/A',
            'Docentes': item.docentesComision
                ?.map(d => d.docente?.nombreProf + ' ' + d.docente?.apePatProf|| 'Docente sin nombre')
                .join(', ') || 'N/A',
            'Estado': item.estadoCalculado,
            'Observaciones': item.observaciones || ''
        }));
    }

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
            
            // Procesamos los datos para que el botón los reciba limpios
            datosFormateados = formatearResultados(resultados);
            
            console.log("Resultados procesados:", datosFormateados);
        } catch (e) {
            console.error('Error buscando:', e);
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
                {#if resultados.length > 0}
                    <div class="is-flex is-justify-content-flex-end mb-3">
                        <BotonExportar
                            dataToExport={datosFormateados}
                            filename="reporte_comisiones_ujat"
                            title="Reporte Detallado de Comisiones"
                        />
                    </div>
                {/if}

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
    /* Estilo adicional por si la tabla es muy ancha */
    .table-wrapper {
        overflow-x: auto;
    }
</style>