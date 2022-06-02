<script lang="ts">
  import IconVolume from "virtual:icons/heroicons-outline/volume-up"

  import { createEventDispatcher } from "svelte"

  const dispatcher = createEventDispatcher()

  function handleInput() {}
</script>

<main>
  <IconVolume />

  <input type="range" name="volume slider" id="volume" min="0" max="100" />
</main>
