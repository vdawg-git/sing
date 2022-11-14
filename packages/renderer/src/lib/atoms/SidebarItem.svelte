<script lang="ts">
  import { useNavigate } from "svelte-navigator"

  import type { IRoutes } from "@/Consts"

  import type { SvelteComponentDev } from "svelte/internal"

  export let to: IRoutes
  export let label: string
  export let icon: typeof SvelteComponentDev | undefined = undefined
  export let isActive: boolean

  const navigate = useNavigate()
</script>

<button
  on:click={isActive ? undefined : () => navigate(to)}
  class="
    -ml-2 flex  w-full items-center overflow-hidden rounded-md px-3 py-1.5
		align-middle text-sm font-medium tracking-wider hover:text-white
    {isActive
    ? 'bg-grey-400/60 text-white'
    : 'text-grey-200 hover:bg-grey-500  active:bg-grey-400/60'}"
>
  {#if icon}
    <svelte:component this={icon} class="mr-3 h-6 w-6" />
  {/if}
  <div class="overflow-hidden text-ellipsis whitespace-nowrap ">
    {label}
  </div>
</button>
