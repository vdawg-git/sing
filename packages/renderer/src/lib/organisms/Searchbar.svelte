<script lang="ts">
  import IconSearch from "virtual:icons/heroicons-outline/search"
  import SearchResultBlock from "@/lib/molecules/SearchResultBlock.svelte"
  import IconX from "virtual:icons/heroicons-outline/x"

  import type { ISearchResult } from "@sing-types/Types"

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
        searchResult = response
      })
    }
  }

  function handleFocused() {
    isFocused = true
  }

  function close() {
    isFocused = false
    searchInputElement?.blur()
    searchInput = undefined
  }

  function handleClick() {
    searchInputElement.focus()
  }
</script>

<div
  class="
    custom_ flex max-h-[calc(100vh-120px)] cursor-text flex-col overflow-x-hidden
    border border-grey-400/50 shadow-xl backdrop-blur-md  
    {isFocused ? 'bg-grey-800/80' : 'bg-grey-700/40 hover:bg-grey-800/50'} 
  "
  style="border-radius: {isFocused ? '12px' : '48px'};
         width: {isFocused ? 'calc(100% - 48px)' : '256px'};
         "
  on:click={handleClick}
>
  <!--- Input -->
  <div class="group flex items-center gap-3 px-3  py-2.5">
    <div class="shrink-0 grow-0">
      <IconSearch class="h-5 w-5 text-white" />
    </div>
    <input
      type="text"
      class="grow bg-transparent outline-none placeholder:text-grey-100"
      placeholder="Search"
      bind:this={searchInputElement}
      on:focus={handleFocused}
      bind:value={searchInput}
    />

    <!---- Close Button -->
    {#if isFocused}
      <button on:click|stopPropagation={close}>
        <IconX class="h-6 w-6 text-grey-300 hover:text-grey-400" />
      </button>
    {/if}
  </div>

  <!---- Results -->
  {#if isFocused && isActive && hasResponse}
    <div class="mask_ max-h-full overflow-y-auto overflow-x-hidden pt-3">
      {#if hasMatches && searchResult !== undefined}
        <div class="flex flex-col gap-3">
          {#each resultsAsTuples as data}
            <SearchResultBlock {data} on:closeSearchbar={close} />
          {/each}
          <!---- Spacer element -->
          <div class="h-6 w-6" />
        </div>
      {:else}
        <div class="p-3 pt-0">No results</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .custom_ {
    transition: all;
    transition-duration: 130ms;
  }

  .mask_ {
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0px,
      black 12px,
      black 90%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0px,
      black 12px,
      black 90%,
      transparent 100%
    );
  }
</style>
