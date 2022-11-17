<script lang="ts">
  import IconPen from "virtual:icons/heroicons/pencil"

  import type { FilePath } from "@sing-types/Filesystem"

  import CoverAndPlaylistThumbnail from "../atoms/CoverAndPlaylistThumbnail.svelte"

  export let image: FilePath | readonly FilePath[] | undefined = undefined
  export let title = "Choose a image"
  export let buttonLabel = "Pick image"
  export let message = "WHAT IS THIS MESSAGE"

  async function pickImage() {
    const { filePath, canceled } = await window.api.selectImage({
      title,
      buttonLabel,
      message,
    })

    if (canceled) return

    image = filePath
  }
</script>

<div class="group:" on:click={pickImage}>
  <div
    class="flex items-center bg-grey-900/60 align-middle text-grey-200 opacity-0 group-hover:opacity-100"
  >
    <IconPen class="h-8 w-8" />
    {title}
  </div>
  <CoverAndPlaylistThumbnail {image} />
</div>
