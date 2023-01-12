<script lang="ts">
  import IconPen from "virtual:icons/heroicons/pencil"

  import CoverAndPlaylistThumbnail from "../atoms/CoverAndPlaylistThumbnail.svelte"

  import type { FilePath } from "@sing-types/Filesystem"

  export let image: FilePath | readonly FilePath[] | undefined = undefined
  export let title = "Choose image"
  export let buttonLabel = "Pick image"
  export let message = "Select image"
  // eslint-disable-next-line func-style
  export let handleOnClick: () => void | Promise<void> = pickImage

  // TODO add remove image button, if one is set

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

<button
  class="group relative h-full w-full overflow-hidden rounded-md"
  on:click={handleOnClick}
>
  <div
    class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-grey-900/90 text-grey-200 opacity-0 group-hover:opacity-100"
  >
    <IconPen class="h-8 w-8" />
    {title}
  </div>
  <CoverAndPlaylistThumbnail {image} />
</button>
