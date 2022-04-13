<script lang="ts">
  import FolderButton from "../atoms/FolderButton.svelte"
  import { isSubdirectory } from "@/Helper"

  export let paths: string[] = []

  function handleFolderAdded(newPaths: string[]) {
    if (newPaths.length <= 0) throw new Error("No folder paths providied")

    for (const newPath of newPaths) {
      if (paths.indexOf(newPath) !== -1) {
        console.error("path already exists: " + newPath)
        return
      }

      for (const path of paths) {
        if (isSubdirectory(path, newPath)) {
          console.error(`${newPath} is subdirectory of ${path}`)
          return
        }
      }

      paths = [...paths, newPath]
    }

    console.table(paths)
  }

  //TODO fix if deleting last existing element
  function handleFolderRemoved(path: string) {
    console.log("Function folder delete")
    const indexOfPath = paths.indexOf(path)
    paths = paths.splice(indexOfPath, 1)
    console.table(paths)
  }

  function handleFolderEdited({
    oldPath,
    newPaths,
  }: {
    oldPath: string
    newPaths: string[]
  }) {
    console.log("Edit path")
    if (newPaths.length <= 0) {
      console.error("No new paths provided")
      return
    }

    const index = paths.indexOf(oldPath)
    paths[index] = newPaths[0]
    paths = [...paths, ...newPaths.slice(1)]

    console.table(paths)
  }
</script>

<div class=" text-grey-200" data-testid="folderPickerModal">
  <div class="grid" />
  {#if paths.length === 0}
    <FolderButton on:folderAdded={(e) => handleFolderAdded(e.detail)} />
  {:else}
    {#each paths as path (path)}
      <div>
        <FolderButton
          {path}
          on:folderRemoved={(e) => handleFolderRemoved(e.detail)}
          on:folderEdited={(e) => handleFolderEdited(e.detail)}
          class="mb-2"
        />
      </div>
    {/each}
    <FolderButton on:folderAdded={(e) => handleFolderAdded(e.detail)} />
  {/if}
</div>
