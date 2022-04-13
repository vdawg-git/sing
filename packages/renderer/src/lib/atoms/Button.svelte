<script lang="ts">
	export let text: string
	export let type: "solid" | "outline" = "solid"

	const solid = "bg-grey-100  text-grey-900 hover:bg-grey-200"
	const outline =
		"bg-transparent text-white border border-grey-100 hover:text-grey-100 hover:border-grey-300"
</script>

<button
	on:click
	class="
	  min-w-[9rem] flex justify-center  px-6 py-3 
		cursor-pointer rounded-xl uppercase
		{type === 'solid' ? solid : type === 'outline' ? outline : ''}
		{$$props.class}"
>
	{text}
</button>
