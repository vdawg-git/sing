<script lang="ts">
  import { createEventDispatcher } from "svelte"

  import type { IPlaylist } from "@sing-types/DatabaseTypes"

  import { notifiyError } from "@/Helper"

  import Button from "../atoms/Button.svelte"
  import CoverAndPlaylistThumbnail from "../atoms/CoverAndPlaylistThumbnail.svelte"
  import TextInput from "../atoms/TextInput.svelte"

  import Modal from "./Modal.svelte"

  export let playlist: IPlaylist

  const dispatch = createEventDispatcher<{ hide: never }>()

  $: id = playlist.id

  let name = playlist.name
  let description = playlist.description

  $: console.log(description)

  function save() {
    if (name !== playlist.name) {
      window.api
        .renamePlaylist({ id, name })
        .catch(notifiyError("Failed to rename playlist"))
    }

    if (description !== playlist.description) {
      window.api
        .editPlaylistDescription({ id, description })
        .catch(notifiyError("Failed to edit description"))
    }

    dispatch("hide")
  }
</script>

<Modal on:hide>
  <div class="flex flex-col gap-6">
    <div class=" text-lg">Edit details</div>

    <div class="flex gap-6">
      <div class="h-[200px] w-[200px]">
        <CoverAndPlaylistThumbnail
          image={playlist.thumbnailCovers?.map(({ filepath }) => filepath)}
        />
        
      </div>

      <div class="flex h-[200px] flex-col gap-4">
        <TextInput
          bind:value={name}
          label="Name"
          placeholder={playlist?.name ?? ""}
          width="100%"
          classes="flex-grow-0"
        />
        <TextInput
          isTextArea
          bind:value={description}
          label="Description"
          placeholder={"The playlists description"}
          width="100%"
          classes="flex-grow"
          maxlength={150}
        />
      </div>
    </div>

    <Button label="Save" on:click={save} />
  </div>
</Modal>
