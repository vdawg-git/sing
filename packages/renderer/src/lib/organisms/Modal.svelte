<script lang="ts">
  import { fade } from "svelte/transition"
  import { createEventDispatcher, onDestroy } from "svelte"
  import IconX from "virtual:icons/heroicons-outline/x"
  import { TEST_ATTRIBUTES } from "@/TestConsts"

  onDestroy(async () => {
    console.log("onDestroy called")
  })

  const dispatch = createEventDispatcher()

  function handleRemove() {
    dispatch("hide")
  }
</script>

<div
  data-testattribute={TEST_ATTRIBUTES.modalWrapper}
  class="
       fixed inset-0 z-40 flex h-screen w-screen content-center 
       items-center justify-center bg-grey-900/60"
  on:click|self={handleRemove}
  transition:fade={{ duration: 200 }}
>
  <div
    data-testattribute={TEST_ATTRIBUTES.modalContent}
    class="
            shadow-black/50 z-50 w-[30rem]  rounded-2xl bg-grey-600/50 p-8 shadow-2xl backdrop-blur-lg
	          {$$props.class}
            "
  >
    <button
      class="absolute top-3 right-3"
      on:click={handleRemove}
      data-testattribute={TEST_ATTRIBUTES.modalCloseButton}
      ><IconX
        class="h-5 w-5 text-grey-400 transition-colors hover:text-grey-100"
      /></button
    >
    <slot><span class="text-red-500">Nothing provided</span></slot>
  </div>
</div>
