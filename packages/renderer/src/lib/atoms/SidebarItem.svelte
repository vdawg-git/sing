<script lang="ts">
  import { useNavigate } from "svelte-navigator"

  import { useOpenContextMenu } from "../manager/menu"

  import type { IRoutes } from "@/Consts"
  import type { IMenuItemsArgument } from "@/types/Types"
  import type { SvelteComponentDev } from "svelte/internal"

  export let to: IRoutes
  export let label: string
  export let icon: typeof SvelteComponentDev | undefined = undefined
  export let isActive: boolean
  export let contextMenuItems: IMenuItemsArgument | undefined = undefined

  const navigate = useNavigate()

  const openContextMenu = contextMenuItems
    ? useOpenContextMenu
    : () => undefined
</script>

<button
  on:click={isActive ? undefined : () => navigate(to)}
  use:openContextMenu={{ menuItems: contextMenuItems ?? [] }}
  class="
    -ml-2 flex  w-full items-center overflow-hidden rounded-md px-3 py-1.5
		align-middle text-sm font-medium tracking-wider hover:text-white
    {isActive
    ? 'bg-grey-300/50 text-white'
    : 'text-grey-200 hover:bg-grey-500  active:bg-grey-400/60'}"
>
  {#if icon}
    <svelte:component this={icon} class="mr-3 h-6 w-6" />
  {/if}
  <div class="overflow-hidden text-ellipsis whitespace-nowrap ">
    {label}
  </div>
</button>
