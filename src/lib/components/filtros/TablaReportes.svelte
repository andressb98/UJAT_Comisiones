<script lang="ts">
    export let resultados: any[] = [];

    function getStatusClass(status: string) {
        switch (status) {
            case 'FINALIZADA': return 'is-danger is-light';
            case 'EN_PROCESO': return 'is-warning is-light';
            case 'PENDIENTE': return 'is-info is-light';
            default: return 'is-light';
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };
</script>

<div class="table-container box p-0">
    <table class="table is-hoverable is-fullwidth is-striped">
        <thead>
            <tr class="has-background-white-ter">
                <th class="is-size-7">Folio / Clave</th>
                <th class="is-size-7">Docente(s)</th>
                <th class="is-size-7">Tipo de Comisión</th>
                <th class="is-size-7">Lugar</th>
                <th class="is-size-7">Periodo</th>
                <th class="is-size-7 has-text-centered">Estado</th>
                <th class="is-size-7 has-text-centered">Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#if resultados.length === 0}
                <tr>
                    <td colspan="7" class="has-text-centered py-6 has-text-grey">
                        <span class="icon is-large"><i class="fas fa-inbox fa-2x"></i></span>
                        <p>No se encontraron comisiones con los filtros seleccionados.</p>
                    </td>
                </tr>
            {:else}
                {#each resultados as comision}
                    <tr>
                        <td class="is-narrow">
                            <p class="has-text-weight-bold is-size-7">{comision.folio}</p>
                            <p class="is-size-7 has-text-grey">{comision.claveComision}</p>
                        </td>
                        <td>
                            {#each comision.docentesComision as dc}
                                <div class="is-size-7">
                                    <span class="icon is-small"><i class="fas fa-user"></i></span>
                                    {dc.docente.nombreProf} {dc.docente.apePatProf}
                                </div>
                            {/each}
                        </td>
                        <td class="is-size-7">
                            {comision.tipoComision?.nombre || 'N/A'}
                        </td>
                        <td class="is-size-7">
                            {comision.lugar?.descripcion || 'No especificado'}
                        </td>
                        <td class="is-size-7">
                            <div><strong>Inicia:</strong> {formatDate(comision.fechaInicio)}</div>
                            {#if comision.fechaFin}
                                <div><strong>Termina:</strong> {formatDate(comision.fechaFin)}</div>
                            {/if}
                        </td>
                        <td class="has-text-centered">
                            <span class="tag is-small has-text-weight-bold {getStatusClass(comision.estadoCalculado)}">
                                {comision.estadoCalculado}
                            </span>
                        </td>
                        <td class="has-text-centered">
                            <div class="buttons is-centered">
                                <button class="button is-small is-white has-text-info" title="Ver Detalles">
                                    <span class="icon"><i class="fas fa-eye"></i></span>
                                </button>
                                <button class="button is-small is-white has-text-success" title="Descargar PDF">
                                    <span class="icon"><i class="fas fa-file-pdf"></i></span>
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>

<div class="level mt-2 px-3">
    <div class="level-left">
        <p class="is-size-7 has-text-grey">
            Mostrando <strong>{resultados.length}</strong> resultados encontrados.
        </p>
    </div>
</div>

<style>
    .table-container {
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #dbdbdb;
    }
    th {
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    td {
        vertical-align: middle !important;
    }
    .tag {
        min-width: 90px;
    }
</style>