<script lang="ts">
  export let label: string
  export let value: string | undefined
  export let placeholder: string
  export let isTextArea = false
  export let width: string | undefined = undefined
  export let classes: string | undefined = undefined
  export let autocomplete = false
  export let maxlength = 240

  const baseClasses = `rounded-md border border-transparent bg-grey-400 px-3  shadow-sm  outline-none      placeholder:text-grey-200 focus:border-grey-400 focus:bg-grey-500 `
</script>

<div class="group relative {classes}">
  <label
    for={label}
    class="absolute top-0 left-3 -translate-y-1/2 text-xs font-medium opacity-0 transition-opacity duration-100 ease-in group-focus-within:opacity-100"
    >{label}</label
  >

  {#if isTextArea}
    <textarea
      name={label}
      class={`${baseClasses} h-full pt-1.5 `}
      {placeholder}
      style:width
      bind:value
      {maxlength}
      autocomplete={autocomplete === true ? "on" : "off"}
    />
  {:else}
    <input
      type="text"
      name={label}
      {placeholder}
      bind:value
      class={`${baseClasses} h-10`}
      on:change
      on:click
      style:width
      {maxlength}
      autocomplete={autocomplete === true ? "on" : "off"}
    />
  {/if}
</div>

<style lang="postcss">
  .group label::before {
    content: "";
    background-color: theme(colors.grey.500);
    height: 2px;
    width: 120%;
    transform: translate(-10%, 0%);
    top: 50%;
    position: absolute;
    z-index: -1;
  }
</style>
