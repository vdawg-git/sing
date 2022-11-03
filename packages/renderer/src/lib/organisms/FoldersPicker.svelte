<script lang="ts">
  import { isSubdirectory } from "@/Helper"
  import { TEST_IDS as id } from "@/TestConsts"

  import FolderInput from "@/lib/molecules/FolderInput.svelte"

  export let paths: string[] = []

  function handleFolderAdded(newPaths: string[]) {
    if (newPaths.length <= 0) throw new Error("No folder paths providied")

    for (const newPath of newPaths) {
      if (paths.includes(newPath)) {
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

  // TODO fix if deleting last existing element
  function handleFolderRemoved(path: string) {
    const indexOfPath = paths.indexOf(path)
    paths = paths.filter((_, index) => index !== indexOfPath)
  }

  function handleFolderEdited({
    oldPath,
    newPaths,
  }: {
    oldPath: string
    newPaths: string[]
  }) {
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
  <FolderInput
    testID={id.settingsFoldersEmptyInput}
    on:folderAdded={(e) => handleFolderAdded(e.detail)}
  />
</div>
