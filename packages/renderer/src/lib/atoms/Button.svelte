<script lang="ts">
  import type { SvelteComponentDev } from "svelte/internal"

  export let label: string
  export let primary = true
  export let classes: string | undefined = undefined
  export let testid: string | undefined = undefined
  export let icon: typeof SvelteComponentDev | undefined = undefined
  export let disabled: boolean = false

  const buttonClass = primary
    ? "bg-grey-100  text-grey-900"
    : "text-white bg-grey-600"
</script>

<button
  data-testid={testid}
  on:click
  class="flex min-w-[9rem] cursor-pointer  justify-center gap-3 rounded-lg
		    px-6 py-3 uppercase  transition-opacity hover:opacity-80 active:opacity-60 disabled:cursor-default disabled:bg-grey-300 disabled:hover:opacity-100
        {buttonClass} {classes}"
  {disabled}
>
  <svelte:component this={icon} class="-ml-2 h-6 w-6" />
  {label}
</button>
