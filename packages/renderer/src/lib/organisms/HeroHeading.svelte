<script lang="ts">
  import type { IHeroMetaDataItem } from "@/types/Types"

  import type { FilePath } from "@sing-types/Filesystem"
  import type { SvelteComponentDev } from "svelte/internal"

  import Button from "@/lib/atoms/Button.svelte"

  export let image: FilePath | undefined = undefined
  export let type: "Artist" | "Album" | "Playlist" | undefined = undefined
  export let title: string
  export let metadata: IHeroMetaDataItem[]
  export let actions:
    | {
        icon: SvelteComponentDev | undefined
        label: string
        callback: (...arguments_: any[]) => any
      }[]
    | undefined = undefined
</script>

<header>
  <!--- Image / Cover -->
  <div class="mt-32 flex gap-10 align-bottom">
    {#if image}
      <div class="relative h-52 w-52">
        <img src={image} class="h-full w-full" />
        <img
          src={image}
          class="absolute inset-0 top-2 h-full w-full blur-2xl"
        />
      </div>
    {/if}

    <!--- Title  -->
    <div class="flex gap-2">
      {#if type}
        <div class="">{type}</div>
      {/if}
      <h1 class="text-8xl">{title}</h1>

      <!--- Metadata -->
      <div class="flex gap-2">
        {#each metadata as data}
          {#await data then awaitedData}
            <div class:text-bold={awaitedData.bold}>{awaitedData.label}</div>
            {#if metadata.length > 0}
              <div>•</div>
            {/if}
          {/await}
        {/each}
      </div>
    </div>
  </div>

  <!--- Actions -->
  {#if actions}
    <div class="flex gap-6">
      {#each actions as { label, callback, icon }}
        <Button {label} {icon} on:click={callback} />
      {/each}
    </div>
  {/if}
</header>
