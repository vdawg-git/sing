<script lang="ts">
  import FoldersPicker from "./FoldersPicker.svelte"
  import Button from "../atoms/Button.svelte"
  import { onMount } from "svelte"

  let paths: string[]

  onMount(
    async () =>
      (paths = (await window.api.getUserSetting("musicFolders")) || [])
  )
</script>

<main class="h-full w-full p-6">
  <div
    class="mx-auto mt-20 flex h-full max-w-[640px] flex-col items-center justify-center"
    data-testid="noContentMessage"
  >
    <div class="min-h-[18rem] w-full max-w-xl">
      <h1 class="mb-2 text-xl">Add folders</h1>
      <p class="mb-6 text-grey-300">
        Choose which folders you want to sync with your library
      </p>
      <FoldersPicker bind:paths />
      <div class="mt-8">
        <Button
          text="Save and sync"
          minHeight={480}
          class="w-full"
          on:click={async () => {
            if (paths === undefined || paths.length === 0) return
            console.log(await window.api.setUserSettings("musicFolders", paths))
            window.api.sync()
          }}
        />
      </div>
    </div>
  </div>
</main>
