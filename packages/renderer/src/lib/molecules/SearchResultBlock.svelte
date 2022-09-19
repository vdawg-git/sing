<script lang="ts">
  import IconChevronDown from "virtual:icons/heroicons-outline/chevron-down"
  import SearchItem from "../atoms/SearchItem.svelte"
  import IconArrowRight from "virtual:icons/heroicons-outline/arrow-right"
  import IconPlay from "virtual:icons/heroicons-outline/play"

  import { match, P } from "ts-pattern"

  import type { ISearchResult, ISubtext } from "@sing-types/Types"
  import { useNavigate } from "svelte-navigator"
  import { ROUTES } from "@/Consts"
  import type { FilePath } from "@sing-types/Filesystem"
  import type { SvelteComponentDev } from "svelte/internal"
  import type { Simplify } from "type-fest"
  import type { StrictExclude } from "ts-essentials"

  // type IType = $$Generic<keyof ISearchResult>
  // type IData = $$Generic<ISearchResult[IType]>

  type IData = Simplify<
    StrictExclude<
      {
        [Key in keyof ISearchResult]: [
          Key,
          Exclude<ISearchResult[Key], undefined>
        ]
      }[keyof ISearchResult],
      undefined
    >
  >

  export let data: IData

  const navigate = useNavigate()

  const displayedCategory = {
    artists: "Artists",
    albums: "Albums",
    tracks: "Tracks",
    topMatches: "Top matches",
  }[data[0]]

  interface ISearchItemProps {
    readonly image: FilePath | undefined
    readonly isImageCircle?: boolean // Only needed for artist currently
    readonly title: string
    readonly label?: string // Only needed for topMatches "album" and "track"
    readonly subtexts: ISubtext[]
    readonly icon: typeof SvelteComponentDev
  }

  const displayData: readonly ISearchItemProps[] | undefined = match(data)
    .with(["topMatches", P.select()], (topMatches) =>
      topMatches.map(({ item }) =>
        match(item)
          .with(
            { type: "artist" },
            ({ primary, image }) =>
              ({
                title: primary,
                subtexts: [{ label: "Artist" }],
                image,
                isImageCircle: true,
                icon: IconArrowRight,
              } as ISearchItemProps)
          )
          .with({ type: "album" }, ({ primary, image, secondary }) => {
            const subtexts = createAlbumSubtexts(secondary)

            return {
              title: primary,
              subtexts,
              image,
              label: "Album",
              icon: IconArrowRight,
            } as ISearchItemProps
          })
          .with(
            { type: "track" },
            ({ primary, image, secondary, tertiary }) => {
              const subtexts = createTrackSubtexts(secondary, tertiary)

              return {
                title: primary,
                subtexts,
                image,
                label: "Track",
                icon: IconPlay,
              } as ISearchItemProps
            }
          )
          .exhaustive()
      )
    )
    .with(["artists", P.select()], (artists) =>
      artists.map((artist) => ({
        title: artist.name,
        subtexts: [{ label: "Artist" }],
        image: artist.image,
        isImageCircle: true,
        icon: IconArrowRight,
      }))
    )
    .with(["albums", P.select()], (albums) =>
      albums.map((album) => {
        const subtexts = createAlbumSubtexts(album?.artist)

        return {
          title: album.name,
          subtexts: subtexts,
          image: album.image,
          icon: IconArrowRight,
        } as ISearchItemProps
      })
    )
    .with(["tracks", P.select()], (tracks) =>
      tracks.map((track) => {
        const artistSubtext: ISubtext | undefined = track.artist
          ? {
              label: track?.artist,
              onClick: () => navigate(`${ROUTES.artists}/${track.artist}`),
            }
          : undefined

        const albumSubtext: ISubtext | undefined = track.album
          ? {
              label: track?.album,
              onClick: () => navigate(`${ROUTES.albums}/${track.album}`),
            }
          : undefined

        const subtexts: ISubtext[] = [
          ...(artistSubtext ? [artistSubtext] : []),
          ...(albumSubtext ? [albumSubtext] : []),
        ]

        return {
          title: track.title,
          subtexts: subtexts,
          image: track.image,
          icon: IconArrowRight,
        } as ISearchItemProps
      })
    )
    .exhaustive()

  function createAlbumSubtexts(albumArtist: string | undefined): ISubtext[] {
    return albumArtist
      ? [
          {
            label: albumArtist,
            onClick: () => navigate(`${ROUTES.artists}/${albumArtist}`),
          },
        ]
      : [{ label: "Unknown" }]
  }

  function createTrackSubtexts(
    album: string | undefined,
    artist: string | undefined
  ): readonly ISubtext[] {
    const albumItem: ISubtext | undefined = album
      ? { label: album, onClick: () => navigate(`${ROUTES.albums}/${album}`) }
      : undefined

    const artistItem: ISubtext | undefined = artist
      ? {
          label: artist,
          onClick: () => navigate(`${ROUTES.artists}/${artist}`),
        }
      : undefined

    return [
      ...(albumItem ? [albumItem] : []),
      ...(artistItem ? [artistItem] : []),
    ]
  }
</script>

{#if displayData !== undefined}
  <!---- Header -->
  <div class="flex flex-col gap-3">
    <div class="gap3 flex">
      <div class="text-xs2 uppercase text-grey-300">{displayedCategory}</div>
      <IconChevronDown class="h-4 w-4" />
    </div>
  </div>

  <!---- Results -->
  {#each displayData as { title, label, subtexts, image, icon }}
    <SearchItem {image} {title} {label} {subtexts} {icon} />
  {/each}
{/if}
