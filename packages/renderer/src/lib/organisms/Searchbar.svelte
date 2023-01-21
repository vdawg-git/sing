<script lang="ts">
  import IconSearch from "virtual:icons/heroicons/magnifying-glass-20-solid"
  import IconX from "virtual:icons/heroicons/x-mark-20-solid"

  import { useOnOutClick } from "@/Helper"

  import { getMenuElement } from "../manager/menu"

  import SearchResultBlock from "@/lib/molecules/SearchResultBlock.svelte"

  import type { ISearchResult } from "@sing-types/Types"

  // TODO close on escape

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let resultsAsTuples: [keyof ISearchResult, any][]
  $: resultsAsTuples = Object.entries(searchResult ?? {}) as [
    keyof ISearchResult,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  ][]

  $: {
    if (searchInput !== undefined) {
      // eslint-disable-next-line unicorn/prefer-top-level-await
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

  function handleInputClick() {
    searchInputElement.focus()
  }
</script>

<div
  class="custom_ flex max-h-[calc(100vh-120px)] flex-col overflow-x-hidden
    border border-grey-400/50 shadow-xl backdrop-blur-xl 
    {isFocused ? 'bg-grey-800/80' : 'bg-grey-700/40 hover:bg-grey-800/50'}"
  style="border-radius: {isFocused ? '8px' : '48px'};
         width: {isFocused ? 'calc(100% - 48px)' : '256px'};"
  use:useOnOutClick={{
    callback: close,
    extraElements: getMenuElement,
    condition: () => isFocused,
  }}
>
  <!--- Input -->
  <div
    class="group flex cursor-text items-center gap-3  px-3 py-2.5"
    on:click={handleInputClick}
  >
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
    <div
      class="mask_ flex max-h-full flex-col overflow-y-auto overflow-x-hidden pt-3"
    >
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
