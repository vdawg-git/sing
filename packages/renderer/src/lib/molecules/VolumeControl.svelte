<script lang="ts">
  import IconVolume from "virtual:icons/heroicons-outline/volume-up"
  import IconVolumeMuted from "virtual:icons/heroicons-outline/volume-off"
  import { TEST_IDS as testID } from "@/TestConsts"
  import { spring } from "svelte/motion"
  import { fade } from "svelte/transition"

  export let disabled = false
  export let value = 1

  const animatedValue = spring(value, {
    damping: 0.2,
    stiffness: 0.09,
  })
  $: {
    animatedValue.set(value)
  }

  let showSlider = false
  let volumeBeforeMute: number | undefined = [value][0] // dont be reactive on value
  $: muted = value === 0

  let timeout: NodeJS.Timeout

  function handleMouseLeave() {
    clearTimeout(timeout)

    timeout = setTimeout(() => (showSlider = false), 500)
  }
  function handleMouseEnter() {
    clearTimeout(timeout)

    timeout = setTimeout(() => (showSlider = true), 50)
  }

  function toggleMute() {
    if (muted) {
      if (volumeBeforeMute) {
        value = volumeBeforeMute
        volumeBeforeMute = undefined
      } else {
        value = 1
      }
    } else {
      volumeBeforeMute = value
      value = 0
    }
  }
</script>

<main
  class="group relative h-6"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <button
    data-testid={testID.playbarVolumeIcon}
    {disabled}
    on:click={toggleMute}
    class="transition-transform active:scale-95"
  >
    {#if !muted}
      <IconVolume class="h-6 w-6" />
    {:else}
      <IconVolumeMuted class="h-6 w-6" />
    {/if}
  </button>

  {#if showSlider}
    <div
      class=" pointer-events-none  absolute bottom-0 -translate-x-[44px] -translate-y-[60px] -rotate-90"
      out:fade={{ duration: 220 }}
    >
      <div
        class="
          shadow_ pointer-events-auto relative z-30 flex h-6 w-28 origin-center translate-x-5
         overflow-hidden rounded-2xl border align-middle outline-grey-300
        "
      >
        <!---- Input ---->
        <input
          data-testid={testID.volumeSlider}
          type="range"
          name="volume slider"
          id="volume_slider"
          min="0"
          max="1"
          step="0.01"
          bind:value
          class="input_"
        />
        <!---- Inner gradient ---->
        <!---- Mask ---->
        <div
          data-testid={testID.volumeSliderInner}
          class="
            pointer-events-none
            absolute inset-0  z-20  h-6 overflow-hidden bg-red-600
            "
          style="width: {$animatedValue > 0 ? $animatedValue * 100 : 0}%;"
        >
          <!---- Fill ---->
          <div
            class="absolute inset-0 h-6 min-w-[112px] bg-gradient-to-r from-amber-500 to-orange-500"
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
    cursor: pointer;

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
