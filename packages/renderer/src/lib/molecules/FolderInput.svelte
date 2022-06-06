<script lang="ts">
  import IconFolderRemove from "virtual:icons/heroicons-outline/folder-remove"
  import IconFolderAdd from "virtual:icons/heroicons-outline/folder-add"
  import { createEventDispatcher } from "svelte"
  import { testAttr } from "@/TestConsts"

  export let path: string | undefined = undefined
  export const symbol = Symbol(`folder-${path}`)

  const dispatch = createEventDispatcher()

  async function pickFolder() {
    const { filePaths: folderPaths, canceled } =
      await window.api.openMusicFolder()

    if (canceled || folderPaths.length === 0) return false

    return folderPaths
  }

  async function handleClick() {
    if (path === undefined) {
      dispatchAdd()
    } else {
      dispatchEdit()
    }
  }

  async function dispatchAdd() {
    const folderPaths = await pickFolder()
    if (folderPaths === false) return

    dispatch("folderAdded", folderPaths)
  }

  async function dispatchRemove() {
    dispatch("folderRemoved", path)
  }

  async function dispatchEdit() {
    const newPaths = await pickFolder()
    if (newPaths === false) return

    dispatch("folderEdited", { oldPath: path, newPaths })
  }
</script>

<button
  data-testattribute={testAttr.folderInput}
  class="
			group  flex
			h-12  w-full place-content-between  items-center
			rounded-xl border
			border-grey-300 px-3
			text-left transition-colors
			duration-100 ease-out hover:border-grey-200
      hover:text-white
			"
  on:click={() => handleClick()}
>
  <div class="mr-6">{path ?? "Add folder…"}</div>

  {#if path}
    <div
      data-testattribute={testAttr.folderInputDeleteIcon}
      class="text-grey-200 hover:text-orange-500"
      on:click|stopPropagation={dispatchRemove}
    >
      <IconFolderRemove class="h-6 w-6" />
    </div>
  {:else}
    <IconFolderAdd class="h-6 w-6 " />
  {/if}
</button>
