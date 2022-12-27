<script lang="ts">
  import IconPlay from "virtual:icons/heroicons/play-circle-solid"

  import CoverAndPlaylistThumbnail from "../atoms/CoverAndPlaylistThumbnail.svelte"
  import { useOpenContextMenu } from "../manager/menu"

  import type { ICardProperties } from "@/types/Types"

  // TODO make secondary text not having hover when there is no action for it.

  export let data: ICardProperties
  export let isImageCircle = false

  $: contextMenuItems = data.contextMenuItems
</script>

<div
  class="group relative"
  on:click
  use:useOpenContextMenu={{ menuItems: contextMenuItems }}
>
  <div
    class="_effects flex w-[220px] flex-col gap-3   rounded-lg bg-grey-600/60
    p-4 backdrop-blur transition-all ease-out group-hover:bg-grey-500/60
    "
  >
    <!--- Cover -->
    <div class="relative h-[188px] w-[188px]">
      <a on:click={data.onClickPrimary}>
        <div class="cover_ cursor-pointer">
          <CoverAndPlaylistThumbnail
            classes=""
            image={data.image}
            isCircle={isImageCircle}
          />
        </div>
      </a>
      <!--- Play button -->
      <button
        class="playButton_ absolute -bottom-4 right-0 z-10 h-14 w-14  rounded-full text-white   opacity-0 transition-all
        group-hover:opacity-100"
        on:click={data.onPlay}
      >
        <IconPlay class="h-14 w-14" />
      </button>
    </div>

    <!--- Metadata - Title & Secondary -->
    <div class="flex flex-col">
      <div
        class="transition-color max-w-fit cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-lg text-white"
        on:click={data.onClickPrimary}
      >
        {data.title}
      </div>
      {#if data.secondaryText}
        <a
          class="max-w-max  overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold tracking-wider text-grey-200 
          {data.onClickSecondary ? 'cursor-pointer hover:underline' : ''}"
          on:click={data.onClickSecondary}
        >
          {data.secondaryText}
        </a>
      {/if}
    </div>
  </div>

  <!-- Background blur hover effect -->
  {#if data.image}
    <div class="glow_ transition-opacity ">
      <img
        class="absolute -bottom-1/3 -right-1/4 h-72 w-72 rounded-full object-cover"
        src={`file://${data.image}`}
      />
    </div>
  {/if}
</div>

<style lang="postcss">
  /* The background image blur */
  .glow_ {
    opacity: 0;
    @apply absolute inset-0 -z-10 overflow-hidden  rounded-lg;

    .group:hover & {
      opacity: 0.45;
    }
  }

  .playButton_ {
    filter: drop-shadow(0px 6px 12px rgb(0 0 0 / 0.5))
      drop-shadow(0px 3px 6px rgb(0 0 0 / 0.5));
    transform: scale(0.5, 0.5);

    .group:hover & {
      transform: scale(1, 1);
    }

    &:active {
      transform: scale(0.96, 0.89) !important;
    }

    &:hover {
      color: theme(colors.grey.100);
    }
  }

  .cover_ {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8));
    transform: scale(1, 1);
    transition: all 150ms cubic-bezier(0.165, 0.84, 0.44, 1);

    .group:active &,
    &:active {
      transform: scale(0.99, 0.99);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.7)) !important;
    }

    .group:hover & {
      filter: drop-shadow(0 16px 16px rgba(0, 0, 0, 0.7));
    }
  }

  ._effects {
    &:hover {
      box-shadow: inset 0.2px 0.5px 1px rgba(255, 255, 255, 0.2);
    }
  }
</style>
