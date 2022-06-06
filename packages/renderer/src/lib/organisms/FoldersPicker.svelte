<script lang="ts">
  import FolderInput from "@/lib/molecules/FolderInput.svelte"
  import { isSubdirectory } from "@/Helper"
  import { TEST_IDS as id } from "@/TestConsts"

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
  }

  //TODO fix if deleting last existing element
  function handleFolderRemoved(path: string) {
    console.log("Function folder delete")
    const indexOfPath = paths.indexOf(path)
    paths = paths.filter((_, index) => index !== indexOfPath)

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

<div
  data-testid={id.settingsFolders}
  class="flex w-full flex-col gap-4 text-grey-200"
>
  {#each paths as path (path)}
    <div>
      <FolderInput
        {path}
        on:folderRemoved={(e) => handleFolderRemoved(e.detail)}
        on:folderEdited={(e) => handleFolderEdited(e.detail)}
      />
    </div>
  {:else}
    <FolderInput on:folderAdded={(e) => handleFolderAdded(e.detail)} />
  {/each}
  <FolderInput on:folderAdded={(e) => handleFolderAdded(e.detail)} />
</div>
