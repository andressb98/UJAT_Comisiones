<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    // Definición de tipos para las columnas
    export let columns: { 
        label: string, 
        key: string, 
        transform?: (val: any, row: any) => string 
    }[] = [];
    
    export let items: any[] = [];
    export let selectedId: number | null = null;
    export let emptyMessage: string = "Sin resultados";

    function handleRowClick(item: any) {
        dispatch('select', item);
    }
</script>

<div class="box">
    <div class="table-container">
        <table class="table is-fullwidth is-hoverable">
            <thead>
                <tr>
                    {#each columns as col}
                        <th>{col.label}</th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#if items.length === 0}
                    <tr>
                        <td colspan={columns.length} class="has-text-centered">
                            {emptyMessage}
                        </td>
                    </tr>
                {:else}
                    {#each items as row (row.id)}
                        <tr
                            class={row.id === selectedId ? 'is-selected' : ''}
                            on:click={() => handleRowClick(row)}
                            style="cursor:pointer"
                        >
                            {#each columns as col}
                                <td>
                                    {#if col.transform}
                                        {@html col.transform(row[col.key], row)}
                                    {:else}
                                        {row[col.key] ?? '-'}
                                    {/if}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</div>