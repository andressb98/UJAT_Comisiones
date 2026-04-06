<script lang="ts">
    import { enhance } from '$app/forms';
    import { toast } from 'svelte-sonner';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto'; // <-- Importación mágica de Chart.js

    // Props de datos con la nueva estructura de las gráficas
    export let data: {
        stats: {
            activasHoy: number;
            esteMes: number;
            docentesInvolucrados: number;
            lugaresUtilizados: number;
            porcentajeCanceladas: number;
        };
        lineaTiempo: any[];
        proximasComisiones: any[];
        chartTipo: { labels: string[], data: number[] };
        chartDocente: { labels: string[], data: number[] };
    };

    // Estado de filtros
    let periodoSeleccionado = 'mes';
    
    // Referencias exclusivas para los <canvas>
    let canvasTipo: HTMLCanvasElement;
    let canvasDocente: HTMLCanvasElement;

    // Instancias de Chart.js para poder destruirlas después
    let chartTipoInstance: Chart;
    let chartDocenteInstance: Chart;

    // Función para ver detalle
    function verDetalle(clave: string) {
        toast.info(`Cargando detalle de: ${clave}`);
    }

    onMount(() => {
        // Gráfica: Distribución por Tipo (Doughnut)
        if (canvasTipo && data.chartTipo?.labels.length > 0) {
            chartTipoInstance = new Chart(canvasTipo, {
                type: 'doughnut',
                data: {
                    labels: data.chartTipo.labels,
                    datasets: [{
                        data: data.chartTipo.data,
                        backgroundColor: ['#00d1b2', '#3273dc', '#ffdd57', '#f14668', '#48c774'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // Gráfica: Top Docentes (Barra)
        if (canvasDocente && data.chartDocente?.labels.length > 0) {
            chartDocenteInstance = new Chart(canvasDocente, {
                type: 'bar',
                data: {
                    labels: data.chartDocente.labels,
                    datasets: [{
                        label: 'Comisiones',
                        data: data.chartDocente.data,
                        backgroundColor: '#3273dc',
                        borderRadius: 4
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }, // Ocultamos la leyenda para más limpieza
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        }

        // Limpieza fundamental para Svelte
        return () => {
            if (chartTipoInstance) chartTipoInstance.destroy();
            if (chartDocenteInstance) chartDocenteInstance.destroy();
        };
    });
</script>

<section class="section">
    <div class="container">
        <div class="level mb-5">
            <div class="level-left">
                <div>
                    <h1 class="title is-4">Panel del Coordinador</h1>
                    <h2 class="subtitle is-6">Resumen de comisiones gestionadas</h2>
                </div>
            </div>
            <div class="level-right">
                <div class="field has-addons">
                    <p class="control">
                        <span class="select is-small">
                            <select bind:value={periodoSeleccionado}>
                                <option value="hoy">Hoy</option>
                                <option value="semana">Esta semana</option>
                                <option value="mes">Este mes</option>
                                <option value="rango">Rango personalizado</option>
                            </select>
                        </span>
                    </p>
                    <p class="control">
                        <button class="button is-small is-link">
                            <span class="icon is-small"><i class="fas fa-sync"></i></span>
                            <span>Actualizar</span>
                        </button>
                    </p>
                </div>
            </div>
        </div>

        <div class="columns is-multiline">
            {#each [
                { label: 'Activas hoy', val: data.stats?.activasHoy || 0 },
                { label: 'Este mes', val: data.stats?.esteMes || 0 },
                { label: 'Docentes', val: data.stats?.docentesInvolucrados || 0 },
                { label: 'Lugares', val: data.stats?.lugaresUtilizados || 0 },
                { label: '% Canceladas', val: `${data.stats?.porcentajeCanceladas || 0}%` }
            ] as kpi}
                <div class="column is-one-fifth-desktop is-half-mobile">
                    <div class="box has-text-centered is-relative shadow-sm hover-up">
                        <p class="heading has-text-grey">{kpi.label}</p>
                        <p class="title is-3 has-text-info">{kpi.val}</p>
                    </div>
                </div>
            {/each}
        </div>

        <div class="columns">
            <div class="column is-4">
                <div class="box timeline-container">
                    <h2 class="subtitle is-5 mb-4">Línea del tiempo</h2>
                    <div class="timeline">
                        {#each data.lineaTiempo || [] as c}
                            <div class="timeline-item">
                                <div class="timeline-marker {c.estatus?.toLowerCase()}"></div>
                                <div class="timeline-content">
                                    <p class="is-size-7 has-text-grey">{c.rangoFechas} • {c.rangoHoras}</p>
                                    <p class="has-text-weight-bold is-size-6">{c.tipo}</p>
                                    <p class="is-size-7">{c.docente} en {c.lugar}</p>
                                </div>
                            </div>
                        {:else}
                            <div class="has-text-centered py-5">
                                <span class="icon is-large has-text-grey-light"><i class="fas fa-calendar-day fa-2x"></i></span>
                                <p class="has-text-grey mt-2">Sin actividad reciente</p>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="column is-8">
                <div class="columns">
                    <div class="column">
                        <div class="box">
                            <p class="has-text-weight-semibold mb-3">Distribución por Tipo</p>
                            <div style="position: relative; height: 250px; width: 100%;">
                                <canvas bind:this={canvasTipo}></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="column">
                        <div class="box">
                            <p class="has-text-weight-semibold mb-3">Top Docentes</p>
                            <div style="position: relative; height: 250px; width: 100%;">
                                <canvas bind:this={canvasDocente}></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box">
                    <div class="level is-mobile mb-3">
                        <div class="level-left">
                            <h2 class="subtitle is-5">Próximas comisiones</h2>
                        </div>
                    </div>
                    <div class="table-container">
                        <table class="table is-fullwidth is-striped is-hoverable is-narrow">
                            <thead>
                                <tr>
                                    <th>Clave</th>
                                    <th>Fecha/Hora</th>
                                    <th>Tipo</th>
                                    <th>Docente/Lugar</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each data.proximasComisiones || [] as c}
                                    <tr>
                                        <td class="is-vcentered"><span class="tag is-light">{c.clave}</span></td>
                                        <td class="is-vcentered is-size-7">{c.fecha}<br/>{c.hora}</td>
                                        <td class="is-vcentered">{c.tipo}</td>
                                        <td class="is-vcentered is-size-7"><strong>{c.docente}</strong><br/>{c.lugar}</td>
                                        <td class="is-vcentered has-text-right">
                                            <button class="button is-small is-info is-light" on:click={() => verDetalle(c.clave)}>
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                {:else}
                                    <tr>
                                        <td colspan="5" class="has-text-centered py-5 has-text-grey">
                                            No hay comisiones programadas
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    /* Se eliminaron las clases .chart-placeholder porque ya no se usan */

    .shadow-sm {
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .hover-up {
        transition: transform 0.2s ease;
    }
    .hover-up:hover {
        transform: translateY(-3px);
    }

    /* Timeline mejorado para Bulma */
    .timeline {
        padding: 1rem 0;
        position: relative;
    }
    .timeline::before {
        content: '';
        position: absolute;
        left: 7px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #eee;
    }
    .timeline-item {
        position: relative;
        padding-left: 2rem;
        padding-bottom: 1.5rem;
    }
    .timeline-marker {
        position: absolute;
        left: 0;
        top: 5px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #dbdbdb;
        border: 3px solid white;
        z-index: 1;
        box-shadow: 0 0 0 1px #eee;
    }
    .timeline-marker.programada { background: #3273dc; }
    .timeline-marker.concluida { background: #48c774; }
    .timeline-marker.cancelada { background: #f14668; }

    .timeline-content p {
        margin: 0;
    }
</style>