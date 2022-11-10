<script lang="ts">
  import { Link } from "svelte-navigator"

  import type { IRoutes } from "@/Consts"

  import type { SvelteComponentDev } from "svelte/internal"

  export let to: IRoutes
  export let label: string
  export let icon: typeof SvelteComponentDev | undefined = undefined
  export let isActive: boolean
</script>

<Link {to}>
  <div
    class="
    -ml-2 flex cursor-pointer items-center overflow-hidden rounded-xl p-3
		align-middle text-sm font-medium tracking-wider hover:bg-grey-500/60 active:bg-grey-500/50
    {isActive ? 'text-white ' : 'text-grey-200 hover:text-white '}"
  >
    {#if icon}
      <svelte:component this={icon} class="mr-3 h-6 w-6" />
    {/if}
    <div class="overflow-hidden text-ellipsis whitespace-nowrap ">
      {label}
    </div>
  </div>
</Link>
