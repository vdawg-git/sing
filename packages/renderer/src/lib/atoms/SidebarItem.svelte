<script lang="ts">
  let activeState = false
</script>

<div on:click>
  <div
    class="
    -ml-2 flex cursor-pointer rounded-xl p-3 align-middle 
		active:bg-grey-500
    {!activeState && 'hover:bg-grey-700 '} 
    {activeState && 'bg-grey-600'}"
  >
    <slot name="icon" />
    <slot name="text">No Text provided</slot>
  </div>
</div>
