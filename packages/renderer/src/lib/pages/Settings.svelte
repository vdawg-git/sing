<script lang="ts">
  import FoldersPicker from "@/lib/organisms/FoldersPicker.svelte"
  import Button from "@/lib/atoms/Button.svelte"
  import { onMount } from "svelte"
  import { TEST_IDS as id } from "@/TestConsts"
  import type { DirectoryPath } from "@sing-types/Filesystem"

  let paths: DirectoryPath[]

  onMount(
    async () =>
      (paths = (await window.api.getUserSetting("musicFolders")) || [])
  )
</script>

<main class="h-max w-full p-6 pb-24">
  <div
    class="mx-auto mt-20 flex h-full max-w-[640px] flex-col items-center justify-center"
    data-testid="noContentMessage"
  >
    <div class="min-h-[18rem] w-full max-w-xl">
      <h1 class="mb-2 text-2xl">Add folders</h1>
      <p class="mb-6 text-grey-100">
        Choose which folders you want to sync with your library
      </p>
      <FoldersPicker bind:paths />
      <Button
        text="Save and sync"
        testid={id.settingsFoldersSaveButton}
        classes="w-full mt-8"
        on:click={async () => {
          if (paths === undefined || paths.length === 0) {
            console.error("No paths to sync specified, they are", paths)
            return
          }
          console.log("Syncing paths: " + paths)
          await window.api.setUserSettings("musicFolders", paths)

          await window.api.sync()
        }}
      />
    </div>
  </div>
</main>
