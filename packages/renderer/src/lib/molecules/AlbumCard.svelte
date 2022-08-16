<script lang="ts">
  import IconPlay from "virtual:icons/heroicons-solid/play"

  import type { IAlbum } from "@sing-types/Types"
  import { createEventDispatcher } from "svelte"
  import { useNavigate } from "svelte-navigator"
  import { ROUTES } from "@/Consts"

  const dispatch = createEventDispatcher()
  const navigate = useNavigate()

  export let album: IAlbum

  function navigateToAlbum() {
    navigate(album.name)
  }
</script>

<div class="group relative z-10" on:click>
  <div
    class="z-20 flex w-[220px] flex-col gap-3 rounded-lg bg-grey-600/60 p-4 backdrop-blur
    transition-all ease-out group-hover:bg-grey-500/60
    "
  >
    <!--- Cover -->
    <div class="relative h-[188px] w-[188px]">
      <a on:click={navigateToAlbum} class="cursor-pointer">
        {#if album.coverPath}
          <img
            class="cover_"
            src={`file://${album.coverPath}`}
            alt={`Cover of ${album.name}`}
          />
        {:else}
          <div class="cover_ bg-gradient-to-br from-grey-600 to-grey-700" />
        {/if}
      </a>
      <!--- Play button -->
      <button
        class="playButton_ absolute -bottom-4 right-0 z-20 h-14 w-14  rounded-full text-white   opacity-0 transition-all
        group-hover:opacity-100"
        on:click={() => dispatch("play")}
      >
        <IconPlay class="h-14 w-14" />
      </button>
    </div>

    <!--- Metadata - Name & Artist -->
    <div class="flex flex-col">
      <div
        class="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-lg text-white"
        on:click={navigateToAlbum}
      >
        {album.name}
      </div>
      <a
        class="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-sm text-grey-200 transition-colors hover:text-white"
        on:click={() => navigate(`/${ROUTES.artists}/${album.artistID}`)}
      >
        {album.artistID}
      </a>
    </div>
  </div>

  <!-- Background blur hover effect -->
  {#if album.coverPath}
    <div class="glow_ transition-opacity ">
      <img
        class="absolute -bottom-1/3 -right-1/4 h-72 w-72 rounded-full object-cover"
        src={`file://${album.coverPath}`}
        alt={`Cover of ${album.name}`}
      />
    </div>
  {/if}
</div>

<style lang="postcss">
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
    box-shadow: 0px 4px 12px -2px rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    transform: scale(1, 1);
    transition: all 150ms cubic-bezier(0.165, 0.84, 0.44, 1);

    &:active {
      transform: scale(0.98, 0.98);
      box-shadow: 0px 2px 9px -2px rgba(0, 0, 0, 0.9) !important;
    }

    .group:hover & {
      box-shadow: 0px 8px 19px -4px rgba(0, 0, 0, 0.9);
    }
  }
</style>
