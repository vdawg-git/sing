<script lang="ts">
  import { isSubdirectory } from "@/Helper"
  import { TEST_IDS } from "@/TestConsts"

  import FolderInput from "@/lib/molecules/FolderInput.svelte"

  export let paths: string[] = []

  function handleFolderAdded(newPaths: string[]) {
    if (newPaths.length <= 0) throw new Error("No folder paths providied")

    for (const newPath of newPaths) {
      if (paths.includes(newPath)) {
        console.error("Cannot add folder - path already exists: " + newPath)
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
  data-testid={TEST_IDS.settingsFoldersWrapper}
  class="flex w-full flex-col gap-4 text-grey-200"
>
  {#each paths as path (path)}
    <div>
      <FolderInput
        {path}
        on:folderRemoved={(event) => handleFolderRemoved(event.detail)}
        on:folderEdited={(event) => handleFolderEdited(event.detail)}
      />
    </div>
  {:else}
    <FolderInput on:folderAdded={(event) => handleFolderAdded(event.detail)} />
  {/each}
  <FolderInput
    testID={TEST_IDS.settingsFoldersEmptyInput}
    on:folderAdded={(event) => handleFolderAdded(event.detail)}
  />
</div>
