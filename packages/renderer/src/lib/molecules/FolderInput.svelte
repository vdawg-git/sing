<script lang="ts">
  import IconFolderRemove from "virtual:icons/heroicons/folder-minus"
  import IconFolderAdd from "virtual:icons/heroicons/folder-plus"
  import { createEventDispatcher } from "svelte"

  import { TEST_ATTRIBUTES } from "@/TestConsts"

  export let path: string | undefined = undefined
  export let testID: string | undefined = undefined

  const dispatch = createEventDispatcher()

  async function handleClick() {
    if (path === undefined) {
      addNewFolder()
    } else {
      editFolder()
    }
  }

  async function addNewFolder() {
    const folderPaths = await pickFolder()
    if (folderPaths === undefined) return

    dispatch("folderAdded", folderPaths)
  }

  async function dispatchRemove() {
    dispatch("folderRemoved", path)
  }

  async function editFolder() {
    const newPaths = await pickFolder()
    if (newPaths === undefined) return

    dispatch("folderEdited", { oldPath: path, newPaths })
  }

  async function pickFolder() {
    // FIXME open current path as defaultPath does not work when it includes spaces

    const defaultPath = path ?? "music"

    const { filePaths, canceled } = await window.api.openDirectoryPicker({
      defaultPath,
      buttonLabel: "Select music folder(s)",
      title: "Sing music folder selection",
      properties: ["openDirectory", "multiSelections", "dontAddToRecent"],
      message: "Choose folders to sync",
      securityScopedBookmarks: false,
    })

    if (canceled || filePaths.length === 0) return undefined

    return filePaths
  }

  const filledClass = "bg-grey-400 text-white hover:bg-grey-500"
  const unfilledClass =
    "bg-grey-600 text-color-200 hover:text-grey-200 hover:bg-grey-700"
</script>

<button
  data-testID={testID}
  data-testattribute={TEST_ATTRIBUTES.folderInput}
  class="
			group   flex h-12  w-full place-content-between  items-center 
      rounded-lg	pl-3 text-left transition-colors
			duration-100 ease-out 
      {path ? filledClass : unfilledClass}
      
			"
  on:click={() => handleClick()}
>
  <div class="mr-6">{path ?? "Add folder…"}</div>

  {#if path}
    <button
      data-testattribute={TEST_ATTRIBUTES.folderInputDeleteIcon}
      class="h-12 p-3  transition-colors "
      on:click|stopPropagation={dispatchRemove}
    >
      <IconFolderRemove class="h-6 w-6 hover:text-orange-500" />
    </button>
  {:else}
    <div class="pr-3">
      <IconFolderAdd class="h-6 w-6" />
    </div>
  {/if}
</button>

<style lang="postcss">
</style>
