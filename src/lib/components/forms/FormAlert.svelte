<script lang="ts">
  export let message: string | null = null;
  export let formErrors: string[] = [];
  export let variant: "danger" | "warning" | "info" | "success" = "danger";
</script>

{#if message || (formErrors && formErrors.length)}
  <article class="message is-{variant}">
    <div class="message-body">
      {#if message}
        <div>{message}</div>
      {/if}

      {#if formErrors?.length}
        <ul style="margin-top:.5rem; padding-left:1.25rem;">
          {#each formErrors as e}
            <li>{e}</li>
          {/each}
        </ul>
      {/if}
    </div>
  </article>
{/if}
