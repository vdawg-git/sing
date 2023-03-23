<script lang="ts">
  import { useNavigate } from "svelte-navigator"
  import { isPresent } from "ts-is-present"
  import { pipe } from "fp-ts/lib/function"
  import * as O from "fp-ts/lib/Option"

  import {
    displayTypeWithCount,
    moveItemTo,
    removeDuplicates,
  } from "@sing-shared/Pures"
  import { UNKNOWN_ALBUM } from "@sing-shared/Consts"

  import { backgroundImages } from "@/lib/stores/BackgroundImages"
  import { convertAlbumToCardData } from "@/Helper"
  import { albums } from "@/lib/manager/Player"
  import { PAGE_TITLES } from "@/Constants"

  import { playlistsStore } from "../stores/PlaylistsStore"

  import CardList from "@/lib/organisms/CardList.svelte"
  import HeroHeading from "@/lib/organisms/HeroHeading.svelte"
  import NothingHereYet from "@/lib/organisms/NothingHereYet.svelte"

  import type { ICardProperties } from "@/types/Types"

  const navigate = useNavigate()

  $: {
    backgroundImages.set(
      $albums
        .map((album) => album.cover)
        .filter(isPresent)
        .filter(removeDuplicates)
    )
  }

  let items: readonly ICardProperties[]
  $: {
    const allItems: ICardProperties[] = $albums.map(
      convertAlbumToCardData({ navigate, $playlistsStore })
    )

    //  If there is "Unknown album", move it to the top.
    items = pipe(
      allItems,
      (array) => moveItemTo(array, ({ title }) => title === UNKNOWN_ALBUM, 0),
      O.getOrElse(() => allItems)
    )
  }
</script>

<HeroHeading
  title={PAGE_TITLES.albums}
  metadata={[
    {
      label: displayTypeWithCount("album", $albums.length),
    },
  ]}
/>
{#if $albums.length === 0}
  <NothingHereYet />
{:else}
  <CardList {items} testID="albumCardsGrid" cardTestAttributes="albumCard" />
{/if}
