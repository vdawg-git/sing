<script lang="ts">
  let activeState = false
</script>

<div on:click>
  <div
    class="
    p-3 flex align-middle cursor-pointer active:bg-grey-500 
    {!activeState && 'hover:bg-grey-700 '} 
    {activeState && 'bg-grey-600'}"
  >
    <slot name="icon" />
    <slot name="text">No Text provided</slot>
  </div>
</div>

<style>
</style>
