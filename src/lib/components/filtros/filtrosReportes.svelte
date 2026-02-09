<script lang="ts">
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    // Estados para los filtros
    let filters = {
        docenteId: '',
        tipoComisionId: '',
        lugarId: '',
        fecha: '',
        estado: '',
        unidadId: '',
        divisionId: ''
    };

    // Listas cargadas desde API
    let docentes: any[] = [];
    let tiposComisiones: any[] = [];
    let lugares: any[] = [];
    let estados = ['PENDIENTE', 'EN_PROCESO', 'FINALIZADA']; // Hardcoded o de API
    let unidades: any[] = [];
    let divisiones: any[] = [];

    // Búsquedas locales para los selects
    let searchDocente = "";
    let searchTipo = "";
    let searchLugar = "";
    let searchUnidad = "";
    let searchDivision = "";

    let activeDropdown = null;

    onMount(async () => {
        // Simulación de carga desde tu API/Services
        try {
            const response = await fetch('/api/filtros-comisiones'); 
            const data = await response.json();
            
            docentes = data.docentes || [];
            tiposComisiones = data.tipos || [];
            lugares = data.lugares || [];
            unidades = data.unidades || [];
            divisiones = data.divisiones || [];
        } catch (e) {
            console.error("Error cargando filtros:", e);
        }
    });

    // Funciones de filtrado reactivo para las listas
    $: filteredDocentes = docentes.filter(d => 
        `${d.nombreProf} ${d.apePatProf}`.toLowerCase().includes(searchDocente.toLowerCase())
    );
    
    $: filteredTipos = tiposComisiones.filter(t => 
        t.nombre.toLowerCase().includes(searchTipo.toLowerCase())
    );

    $: filteredLugares = lugares.filter(l => 
        l.descripcion.toLowerCase().includes(searchLugar.toLowerCase())
    );

    function applyFilters() {
        dispatch('filter', filters);
    }

    function clearFilters() {
        filters = { docenteId: '', tipoComisionId: '', lugarId: '', fecha: '', estado: '', unidadId: '', divisionId: '' };
        searchDocente = ""; searchTipo = ""; searchLugar = "";
        applyFilters();
    }

    function selectOption(field, id, label, searchVar) {
        filters[field] = id;
        if (field === 'docenteId') searchDocente = label;
        if (field === 'tipoComisionId') searchTipo = label;
        if (field === 'lugarId') searchLugar = label;
        activeDropdown = null;
    }
</script>

<section class="section pb-0">
    <div class="container">
        <div class="box has-background-light">
            <h2 class="subtitle is-6 has-text-weight-bold mb-3">
                <span class="icon"><i class="fas fa-filter"></i></span> Filtros de Búsqueda
            </h2>
            
            <div class="columns is-multiline is-variable is-2">
                
                <div class="column is-3">
                    <div class="field">
                        <label class="label is-small">Docente</label>
                        <div class="dropdown is-fullwidth {activeDropdown === 'docente' ? 'is-active' : ''}">
                            <div class="dropdown-trigger">
                                <input class="input is-small" type="text" placeholder="Buscar docente..." 
                                    bind:value={searchDocente} on:focus={() => activeDropdown = 'docente'} />
                            </div>
                            <div class="dropdown-menu" id="dropdown-menu" role="menu">
                                <div class="dropdown-content" style="max-height: 200px; overflow-y: auto;">
                                    {#each filteredDocentes as d}
                                        <button class="dropdown-item is-button w-100" on:click={() => selectOption('docenteId', d.id, `${d.nombreProf} ${d.apePatProf}`)}>
                                            {d.nombreProf} {d.apePatProf}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="column is-2">
                    <div class="field">
                        <label class="label is-small">Tipo</label>
                        <div class="dropdown is-fullwidth {activeDropdown === 'tipo' ? 'is-active' : ''}">
                            <div class="dropdown-trigger">
                                <input class="input is-small" type="text" placeholder="Tipo..." 
                                    bind:value={searchTipo} on:focus={() => activeDropdown = 'tipo'} />
                            </div>
                            <div class="dropdown-menu" role="menu">
                                <div class="dropdown-content">
                                    {#each filteredTipos as t}
                                        <button class="dropdown-item is-button w-100" on:click={() => selectOption('tipoComisionId', t.id, t.nombre)}>
                                            {t.nombre}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="column is-2">
                    <div class="field">
                        <label class="label is-small">Lugar</label>
                        <div class="dropdown is-fullwidth {activeDropdown === 'lugar' ? 'is-active' : ''}">
                            <div class="dropdown-trigger">
                                <input class="input is-small" type="text" placeholder="Lugar..." 
                                    bind:value={searchLugar} on:focus={() => activeDropdown = 'lugar'} />
                            </div>
                            <div class="dropdown-menu" role="menu">
                                <div class="dropdown-content">
                                    {#each filteredLugares as l}
                                        <button class="dropdown-item is-button w-100" on:click={() => selectOption('lugarId', l.id, l.descripcion)}>
                                            {l.descripcion}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="column is-2">
                    <div class="field">
                        <label class="label is-small">Fecha</label>
                        <div class="control">
                            <input class="input is-small" type="date" bind:value={filters.fecha} />
                        </div>
                    </div>
                </div>

                <div class="column is-3">
                    <div class="field">
                        <label class="label is-small">Estado</label>
                        <div class="control">
                            <div class="select is-small is-fullwidth">
                                <select bind:value={filters.estado}>
                                    <option value="">Todos los estados</option>
                                    {#each estados as est}
                                        <option value={est}>{est}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="column is-4">
                    <div class="field">
                        <label class="label is-small">Unidad Administrativa</label>
                        <div class="control">
                            <div class="select is-small is-fullwidth">
                                <select bind:value={filters.unidadId}>
                                    <option value="">Seleccione Unidad...</option>
                                    {#each unidades as u}
                                        <option value={u.id}>{u.nombre}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="column is-4">
                    <div class="field">
                        <label class="label is-small">División Académica</label>
                        <div class="control">
                            <div class="select is-small is-fullwidth">
                                <select bind:value={filters.divisionId}>
                                    <option value="">Seleccione División...</option>
                                    {#each divisiones as div}
                                        <option value={div.id}>{div.nombre}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="column is-4 is-flex is-align-items-flex-end">
                    <div class="buttons">
                        <button class="button is-info is-small" on:click={applyFilters}>
                            <span class="icon"><i class="fas fa-search"></i></span>
                            <span>Filtrar</span>
                        </button>
                        <button class="button is-light is-small" on:click={clearFilters}>
                            <span>Limpiar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    .w-100 { width: 100%; text-align: left; border: none; background: transparent; cursor: pointer; }
    .dropdown-item.is-button:hover { background-color: #f5f5f5; }
    .label.is-small { margin-bottom: 0.2rem; }
</style>