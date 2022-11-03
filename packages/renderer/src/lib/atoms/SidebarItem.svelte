<script lang="ts">
  import { Link } from "svelte-navigator"

  import type { IRoutes } from "@/Consts"

  export let to: IRoutes
</script>

<Link {to}>
  <div
    class="
    -ml-2 flex cursor-pointer rounded-xl p-3 align-middle 
		hover:bg-grey-500 active:bg-grey-500/50"
  >
    <slot name="icon" />
    <slot name="label">No Text provided</slot>
  </div>
</Link>
