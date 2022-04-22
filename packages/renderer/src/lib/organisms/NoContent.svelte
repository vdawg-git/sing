<script lang="ts">
  import IconPlusCircle from "virtual:icons/heroicons-solid/plus-circle"
  import Modal from "./Modal.svelte"
  import FoldersPicker from "./FoldersPicker.svelte"
  import Button from "../atoms/Button.svelte"
  import { onMount } from "svelte"

  let showModal = false
  let paths: string[]

  onMount(
    async () =>
      (paths = (await window.api.getUserSetting("musicFolders")) || [])
  )
</script>

<div
  class="mt-20 flex h-full items-center justify-center"
  data-testid="noContentMessage"
>
  <div
    on:click={() => (showModal = true)}
    class="group flex w-full grow cursor-pointer flex-col items-center justify-center text-grey-300 transition-colors ease-in-out hover:text-white"
    data-testid="noContentModalButton"
  >
    <IconPlusCircle
      class="mb-8 h-20 w-20 text-grey-300 transition-colors ease-in-out group-hover:text-grey-100"
    />
    <p class="max-w-md grow">
      It is pretty empty right now. Start adding some folders to sync them with
      your library by clicking here.
    </p>
  </div>
</div>

<Modal show={showModal} on:hide={() => (showModal = false)}>
  <div class="min-h-[18rem]">
    <h1 class="mb-2 text-xl">Add folders</h1>
    <p class="mb-6 text-grey-300">
      Choose which folders you want to sync with your library
    </p>
    <FoldersPicker bind:paths />
  </div>
  <Button
    text="Save and sync"
    minHeight={480}
    class="w-full"
    on:click={async () => {
      if (paths === undefined || paths.length === 0) return
      console.log(await window.api.setUserSettings("musicFolders", paths))
      showModal = false
      window.api.sync()
    }}
  />
</Modal>
