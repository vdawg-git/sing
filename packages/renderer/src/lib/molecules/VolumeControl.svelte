<script lang="ts">
  import IconVolume from "virtual:icons/heroicons-outline/volume-up"
  import { TEST_IDS as testID } from "@/Consts"
  import { spring } from "svelte/motion"
  import { fade } from "svelte/transition"

  export let disabled = false
  export let value = 50

  const animatedValue = spring(value * 0.01, {
    damping: 0.3,
    stiffness: 0.1,
  })
  $: {
    animatedValue.set(value * 0.01)
  }

  let showSlider = false

  let timeout: NodeJS.Timeout

  function handleMouseLeave() {
    clearTimeout(timeout)

    timeout = setTimeout(() => (showSlider = false), 500)
  }
  function handleMouseEnter() {
    clearTimeout(timeout)

    showSlider = true
  }
</script>

<main
  class="group relative"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <button data-testid={testID.playbarVolumeIcon} {disabled}>
    <IconVolume class="h-6 w-6 sm:h-6" />
  </button>

  {#if showSlider}
    <div
      class="absolute bottom-0  -translate-x-[44px] -translate-y-[60px] -rotate-90 cursor-pointer"
      out:fade={{ duration: 220 }}
    >
      <div
        class="
        shadow_ flex h-6 w-28 origin-center translate-x-5   overflow-hidden rounded-2xl  border border-grey-300 align-middle
      "
      >
        <!---- Input ---->
        <input
          data-testid={testID.volumeSlider}
          type="range"
          name="volume slider"
          id="volume_slider"
          min="0"
          max="100"
          bind:value
          class="input_"
        />
        <!---- Inner fill ---->
        <div
          data-testid={testID.volumeSliderInner}
          class="pointer-events-none absolute left-0 bottom-0 z-10  h-full overflow-hidden"
          style="width: {$animatedValue > 0 ? $animatedValue * 100 : 0}%;"
        >
          <div
            class="absolute h-full min-w-[112px] bg-gradient-to-r from-amber-500 to-orange-500"
          />
        </div>
      </div>
    </div>
  {/if}
</main>

<style lang="postcss">
  input[type="range"].input_ {
    -webkit-appearance: none;
    margin: 0px;
    padding: 0px;
    width: 112px;
    height: 24px;
    background-color: red;

    &:focus {
      outline: none;
    }

    &::-webkit-slider-runnable-track {
      background: theme(colors.grey.500);
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 1px;
      height: 24px;
      background-color: red;
      opacity: 0;
    }
  }

  .shadow_ {
    box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.3);
  }
</style>
