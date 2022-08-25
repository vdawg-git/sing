<script lang="ts">
  import type { IHeroAction, IHeroMetaDataItem } from "@/types/Types"

  import type { FilePath } from "@sing-types/Filesystem"

  import Button from "@/lib/atoms/Button.svelte"

  export let image: FilePath | undefined = undefined
  export let type: "Artist" | "Album" | "Playlist" | undefined = undefined
  export let title: string
  export let metadata: IHeroMetaDataItem[]
  export let actions: IHeroAction[] | undefined = undefined
</script>

<header class="mb-10 mt-32 flex max-w-full flex-col justify-start gap-10">
  <div class="flex max-w-full items-end gap-10 text-ellipsis ">
    <!-- Image / Cover -->
    {#if image}
      <div class="relative h-52 w-52 shrink-0">
        <img src={image} class="h-full w-full rounded" />
        <img
          src={image}
          class="absolute left-2  top-4 -z-10 h-48 w-48 rounded-lg opacity-40 blur-lg"
        />
      </div>
    {/if}

    <!-- Text  -->
    <div class="flex min-w-0 max-w-full flex-col gap-2">
      {#if type}
        <div class="">{type}</div>
      {/if}
      <h1
        class="block  h-[120px] overflow-x-hidden text-ellipsis whitespace-nowrap text-8xl"
      >
        {title}
      </h1>

      <!-- Metadata -->
      <div class="-mt-6 flex gap-2">
        {#each metadata as data}
          {#await data then awaitedData}
            <div
              class={awaitedData.bold
                ? "text-bold text-white"
                : "text-grey-100"}
            >
              {awaitedData.label}
            </div>
            {#if metadata.length > 1}
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
      {#each actions as { label, callback, icon, primary }}
        <Button {label} {icon} on:click={callback} {primary} />
      {/each}
    </div>
  {/if}
</header>
