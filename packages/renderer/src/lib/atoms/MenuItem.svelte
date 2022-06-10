<script lang="ts">
  import { testAttr } from "@/TestConsts"

  let activeState = false
</script>

<div on:click data-testattribute={testAttr.menuItem}>
  <div
    class="
    flex cursor-pointer p-3 align-middle active:bg-grey-500 
    {!activeState && 'hover:bg-grey-700 '} 
    {activeState && 'bg-grey-600'}"
  >
    <slot name="icon" />
    <slot name="label">No Text provided</slot>
  </div>
</div>
