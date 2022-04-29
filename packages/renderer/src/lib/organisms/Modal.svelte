<script lang="ts">
  import { fade } from "svelte/transition"
  import { createEventDispatcher } from "svelte"
  export let show = false

  const dispatch = createEventDispatcher()
</script>

{#if show}
  <div
    class="
          fixed inset-0 z-40 flex h-screen w-screen content-center items-center justify-center bg-grey-900/60
          "
    on:click|self={() => {
      dispatch("hide")
    }}
    transition:fade={{ duration: 200 }}
    data-testid="modal"
  >
    <div
      class="
            z-50 w-[30rem] rounded-2xl border border-grey-400 bg-grey-600/50 p-8 shadow-2xl shadow-black/50 backdrop-blur-lg
	          {$$props.class}
            "
      data-testid="modalContent"
    >
      <slot><span class="text-red-500">Nothing provided</span></slot>
    </div>
  </div>
{/if}
