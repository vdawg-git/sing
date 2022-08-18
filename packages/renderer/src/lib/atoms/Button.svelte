<script lang="ts">
  import type { SvelteComponentDev } from "svelte/internal"

  type IButtonType = "solid" | "outline"

  export let label: string
  export let type: IButtonType = "solid"
  export let classes: string | undefined = undefined
  export let testid: string | undefined = undefined
  export let icon: SvelteComponentDev | undefined = undefined

  const buttonTypes: Record<IButtonType, string> = {
    solid: "bg-grey-100  text-grey-900 hover:bg-grey-200",
    outline:
      "bg-transparent text-white border border-grey-100 hover:text-grey-100 hover:border-grey-300",
  }

  const buttonClass = buttonTypes[type] ?? ""
</script>

<button
  data-testid={testid}
  on:click
  class="flex min-w-[9rem] cursor-pointer  justify-center rounded-xl 
		    px-6 py-3 uppercase {buttonClass} {classes} "
>
  <svelte:component this={icon} />
  {label}
</button>
