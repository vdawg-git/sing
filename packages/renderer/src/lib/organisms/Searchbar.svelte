<script lang="ts">
  import IconSearch from "virtual:icons/heroicons-outline/search"
  import SearchResultBlock from "@/lib/molecules/SearchResultBlock.svelte"

  import type { ISearchResult } from "@sing-types/Types"
  import { keyof } from "io-ts"

  let searchInputElement: HTMLInputElement
  let isFocused = false
  let searchInput: string | undefined

  let searchResult: ISearchResult | undefined

  $: isActive = (searchInput?.length ?? 0) > 0

  // Check if the component got a search response
  $: hasResponse = searchResult !== undefined

  // Check if the response resulted in matches
  $: hasMatches =
    searchResult !== undefined && Object.keys(searchResult).length > 0

  let resultsAsTuples: [keyof ISearchResult, any][]
  $: resultsAsTuples = Object.entries(searchResult ?? {}) as [
    keyof ISearchResult,
    any
  ][]

  $: {
    if (searchInput !== undefined) {
      window.api.search(searchInput).then((response) => {
        console.log(response)
        searchResult = response
      })
    }
  }

  $: console.log({
    isActive,
    hasResponse,
    isFocused,
    searchResult,
  })

  function handleFocused() {
    isFocused = true
  }

  function handleFocusedLost() {
    // isFocused = false
    // searchInput = undefined // Reset the input to the placeholder text
    // resetSearchResponse()
  }

  function handleClick() {
    searchInputElement.focus()
  }

  /**
   * Reset the response data to avoid showing old results when reopening the search bar
   */
  function resetSearchResponse() {
    searchResult = undefined
  }
</script>

<div
  class="
    absolute top-10 right-6 z-50 cursor-text rounded-full 
    bg-grey-600/60 px-3 py-2.5 backdrop-blur-md transition-[width,heigth]
    {isFocused ? 'w-[496px]' : 'w-64'}
  "
  on:click={handleClick}
>
  <div class="flex items-center gap-3">
    <!--- Input -->
    <div class="shrink-0 grow-0">
      <IconSearch class="h-5 w-5 text-white" />
    </div>
    <input
      type="text"
      class="grow bg-transparent outline-none placeholder:text-grey-200"
      placeholder="Search"
      bind:this={searchInputElement}
      on:focus={handleFocused}
      on:focusout={handleFocusedLost}
      bind:value={searchInput}
    />
  </div>

  <!---- Results -->
  {#if isFocused && isActive && hasResponse}
    {#if hasMatches && searchResult !== undefined}
      {#each resultsAsTuples as data}
        <SearchResultBlock {data} />
      {/each}
      <div class="">Results should be here</div>
    {:else}
      <div class="">No results</div>
    {/if}
  {:else}
    Is not active
  {/if}
</div>
