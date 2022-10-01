<script lang="ts">
  import IconChevronDown from "virtual:icons/heroicons-outline/chevron-down"
  import SearchResultItem from "../atoms/SearchResultItem.svelte"

  import { match, P } from "ts-pattern"

  import type {
    ISearchResultItem,
    IConvertedSearchData,
  } from "@sing-types/Types"
  import { useNavigate } from "svelte-navigator"
  import { convertSearchedDataToSearchItems } from "./SearchResultBlockHelper"
  import { createEventDispatcher } from "svelte"

  // type IType = $$Generic<keyof ISearchResult>
  // type IData = $$Generic<ISearchResult[IType]>

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
    .otherwise(() => Infinity)

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
      <IconChevronDown class="h-4 w-4 text-grey-300" />
    </div>

    <!---- Results -->
    <div class="flex flex-col ">
      {#each isExpanded ? displayData : displayData.slice(0, amountToDisplay) as { title, label, subtexts, image, icon, onClick }}
        <div
          class=""
          on:click|stopPropagation={() => {
            onClick()
            dispatch("closeSearchbar")
          }}
        >
          <SearchResultItem {image} {title} {label} {subtexts} {icon} />
        </div>
      {/each}
    </div>
  </div>
{/if}
