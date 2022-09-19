<script lang="ts">
  import { TEST_IDS as id } from "@/TestConsts"

  import type { SvelteComponentDev } from "svelte/internal"

  export let componentToTest: ConstructorOfATypedSvelteComponent
  export let slottedComponent: ConstructorOfATypedSvelteComponent | undefined =
    undefined
</script>

<svelte:component
  this={componentToTest}
  menuTestID={id.test}
  iconTestID={id.testIcon}
>
  {#if slottedComponent}
    <svelte:component this={slottedComponent} />
  {:else}
    <h1 data-testid={id.slottedComponent}>Test text</h1>
  {/if}
</svelte:component>
