<script lang="ts">
  export let text: string
  export let type: "solid" | "outline" = "solid"
  export let classes: string | undefined = undefined
  export let testid: string | undefined = undefined

  const solid = "bg-grey-100  text-grey-900 hover:bg-grey-200"
  const outline =
    "bg-transparent text-white border border-grey-100 hover:text-grey-100 hover:border-grey-300"
</script>

<button
  data-testid={testid}
  on:click
  class="
	  flex min-w-[9rem] cursor-pointer  justify-center rounded-xl 
		px-6 py-3 uppercase {classes}
		{type === 'solid' ? solid : type === 'outline' ? outline : ''}
		"
>
  {text}
</button>
