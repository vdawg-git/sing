<script lang="ts">
  import { useNavigate } from "svelte-navigator"


  import { ROUTES } from "@/Consts"
  import { displayTrackMetadata } from "@/Helper"
  import { TEST_ATTRIBUTES } from "@/TestConsts"

  import { useOpenContextMenu } from "../manager/menu"

  import type {
    ICreateMenuOutOfTrack,
    ITrackListDisplayOptions,
  } from "@/types/Types"
  import type { ITrack } from "@sing-types/DatabaseTypes"
  import type { StrictExtract } from "ts-essentials"

  export let track: ITrack
  export let displayOptions: ITrackListDisplayOptions
  export let createContextMenuItems: ICreateMenuOutOfTrack

  const navigate = useNavigate()

  $: contextMenuItems = createContextMenuItems({
    type: "track",
    id: track.id,
    name: displayTrackMetadata("title", track),
  })

  function navigateTo(type: StrictExtract<keyof ITrack, "album" | "artist">) {
    if (!track[type]) throw new Error("Invalid navigation")

    const route = `/${type === "album" ? ROUTES.albums : ROUTES.artists}/${
      track[type]
    }`
    return () => navigate(route)
  }
</script>

<div
  data-testattribute={TEST_ATTRIBUTES.trackItem}
  class="
    group relative  z-10  flex h-16 w-full cursor-pointer auto-cols-[1fr] items-center
    overflow-visible
  "
  on:dblclick
  use:useOpenContextMenu={{ menuItems: contextMenuItems }}
>
  <!---- Cover and Title -->
  <div class="mr-6 min-w-0 flex-1 basis-44 py-2">
    <div class="flex min-w-0 items-center">
      {#if displayOptions.cover}
        {#if track?.cover}
          <img
            data-testattribute={TEST_ATTRIBUTES.trackItemCover}
            src="file://{track.cover}"
            alt="Cover of {track?.title || track.filepath.split('/').at(-1)}"
            class="mr-4 h-12 w-12 shrink-0 grow-0 rounded"
          />
        {:else}
          <div
            data-testattribute={TEST_ATTRIBUTES.trackItemCover}
            class="mr-4 h-12 w-12 shrink-0 grow-0 rounded bg-gradient-to-br from-grey-600 to-grey-700"
          />
        {/if}
      {/if}
      <div
        data-testattribute={TEST_ATTRIBUTES.trackItemTitle}
        class=" min-w-0  flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {displayTrackMetadata("title", track)}
      </div>
    </div>
  </div>

  <!---- Artist -->
  {#if displayOptions.artist}
    <a
      data-testattribute={TEST_ATTRIBUTES.trackItemArtist}
      on:click|preventDefault={navigateTo("artist")}
      class="mr-6 flex-1 basis-32  overflow-hidden text-ellipsis whitespace-nowrap align-middle 
        {track.artist ? 'hover:underline disabled:hover:text-white' : ''}"
    >
      {displayTrackMetadata("artist", track)}
    </a>
  {/if}

  <!---- Album -->
  {#if displayOptions.album}
    <a
      data-testattribute={TEST_ATTRIBUTES.trackItemAlbum}
      on:click|preventDefault={navigateTo("album")}
      class="mr-6 flex-1 basis-32 overflow-hidden  text-ellipsis whitespace-nowrap align-middle 
        {track.album
        ? 'transition-colors hover:underline disabled:hover:text-white'
        : ''}
      "
    >
      {displayTrackMetadata("album", track)}
    </a>
  {/if}

  <!---- Duration -->
  <div
    data-testattribute={TEST_ATTRIBUTES.trackItemDuration}
    class="flex-1 grow-0 basis-12 overflow-hidden text-ellipsis whitespace-nowrap text-right align-middle"
  >
    {displayTrackMetadata("duration", track)}
  </div>

  <!---- Hover bg -->
  <div
    class="w-[calc(100% + 2rem)] group-active:bg-grey-60 absolute inset-0 -z-10 -ml-4  -mr-4 h-full  rounded-xl group-hover:bg-grey-500/60"
  />
</div>
