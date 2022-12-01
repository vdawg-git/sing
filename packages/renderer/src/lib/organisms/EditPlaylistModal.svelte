<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { dequal } from "dequal"

  import type { IPlaylist } from "@sing-types/DatabaseTypes"
  import type { FilePath } from "@sing-types/Filesystem"

  import { notifiyError } from "@/Helper"

  import Button from "../atoms/Button.svelte"
  import TextInput from "../atoms/TextInput.svelte"
  import CoverPicker from "../molecules/CoverPicker.svelte"

  import Modal from "./Modal.svelte"

  import type { SvelteComponentDev } from "svelte/internal"

  export let playlist: IPlaylist

  // TODO on "Enter" -> "Save"

  const coverPickerWindowTitle = `Select image for ${playlist.name}`
  const coverPickerWindowMessage = `Select image for ${playlist.name}`
  const coverPickerWindowButton = `Set image`
  const dispatch = createEventDispatcher<{ hide: never }>()

  $: id = playlist.id

  let name = playlist.name
  let description = playlist.description
  let image: FilePath | readonly FilePath[] | undefined =
    playlist.thumbnailCovers?.map(({ filepath }) => filepath)

  let coverPickerElement: SvelteComponentDev

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

    if (
      !dequal(
        Array.isArray(image) ? image : [image],
        playlist.thumbnailCovers?.map(({ filepath }) => filepath)
      ) &&
      (typeof image === "string" || image === undefined)
    ) {
      window.api.updatePlaylistCover({ id, filepath: image })
    }

    dispatch("hide")
  }

  export async function pickImage() {
    window.api
      .selectImage({
        title: coverPickerWindowTitle,
        message: coverPickerWindowMessage,
      })
      .then(({ canceled, filePath }) => {
        if (canceled) return
        image = filePath
      })
  }
</script>

<Modal on:hide>
  <div class="flex flex-col gap-6">
    <div class=" text-lg" on:click={pickImage}>Edit details</div>

    <div class="flex gap-6">
      <div class="h-[200px] w-[200px]">
        <CoverPicker
          bind:image
          bind:this={coverPickerElement}
          title={coverPickerWindowTitle}
          message={coverPickerWindowMessage}
          buttonLabel={coverPickerWindowButton}
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
