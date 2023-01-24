<script lang="ts">
  import { match } from "ts-pattern"
  import { useNavigate } from "svelte-navigator"
  import { createEventDispatcher } from "svelte"

  import SearchResultItem from "../atoms/SearchResultItem.svelte"

  import { convertSearchedDataToSearchItems } from "./SearchResultBlockHelper"

  import type {
    ISearchResultItem,
    IConvertedSearchData,
  } from "@sing-types/Types"

  export let data: IConvertedSearchData
  export let isExpanded = false

  const dispatch = createEventDispatcher<{ closeSearchbar: never }>()

  const navigate = useNavigate()

  // Amount of search items to display in the block
  $: amountToDisplay = match([isExpanded, data[0]])
    .when(
      ([expanded, type]) => !expanded && type === "tracks",
      () => 20
    )
    .when(
      ([expanded, _]) => !expanded,
      () => 3
    )
    .otherwise(() => Number.POSITIVE_INFINITY)

  $: displayedCategory = {
    artists: "Artists",
    albums: "Albums",
    tracks: "Tracks",
    topMatches: "Top matches",
  }[data[0]]

  let displayData: readonly ISearchResultItem[] | undefined

  $: displayData = convertSearchedDataToSearchItems(navigate, data)
</script>

{#if displayData !== undefined}
  <div class="">
    <!---- Header -->
    <div class="ml-3 flex items-center gap-1 text-base">
      <div class="text-xs2 font-bold uppercase tracking-widest text-grey-300">
        {displayedCategory}
      </div>
    </div>

    <!---- Results -->
    <div class="flex flex-col ">
      {#each isExpanded ? displayData : displayData.slice(0, amountToDisplay) as { title, label, subtexts, image, icon, onClick, itemForContextMenu }}
        <SearchResultItem
          {image}
          {title}
          {label}
          {subtexts}
          {itemForContextMenu}
          {icon}
          onClick={() => {
            onClick()
            dispatch("closeSearchbar")
          }}
          on:closeSearchbar
        />
      {/each}
    </div>
  </div>
{/if}
