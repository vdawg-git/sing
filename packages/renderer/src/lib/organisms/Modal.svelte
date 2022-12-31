<script lang="ts">
  import { fade } from "svelte/transition"
  import { createEventDispatcher } from "svelte"
  import IconX from "virtual:icons/heroicons/x-mark-20-solid"

  import { TEST_ATTRIBUTES } from "@/TestConsts"

  export let width: string | undefined = undefined

  const dispatch = createEventDispatcher()

  function handleRemove() {
    dispatch("hide")
  }
</script>

<!-- Background -->
<div
  data-testattribute={TEST_ATTRIBUTES.modalWrapper}
  class="
       fixed inset-0 z-40 flex h-screen w-screen content-center 
       items-center justify-center bg-grey-900/60"
  on:click|self={handleRemove}
  transition:fade|local={{ duration: 200 }}
>
  <!-- Wrapper -->
  <div
    data-testattribute={TEST_ATTRIBUTES.modalContent}
    class="
      shadow-black/50 z-50 rounded-2xl bg-grey-600 p-4 shadow-2xl
      {$$props.class} relative border border-grey-300/50
      "
    style:width
  >
    <!-- Content -->
    <slot><span class="text-red-500">Nothing provided</span></slot>

    <!-- Close Button -->
    <button
      class="absolute top-3 right-3"
      on:click={handleRemove}
      data-testattribute={TEST_ATTRIBUTES.modalCloseButton}
      ><IconX
        class="h-5 w-5 text-grey-100 transition-colors hover:text-grey-200"
      /></button
    >
  </div>
</div>
