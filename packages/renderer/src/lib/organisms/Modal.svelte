<script lang="ts">
	import { fade } from "svelte/transition"
	import { createEventDispatcher } from "svelte"
	export let show = false

	const dispatch = createEventDispatcher()
</script>

{#if show}
	<div
		class="fixed h-screen w-screen bg-grey-900/60 z-40 inset-0 flex justify-center content-center items-center"
		on:click|self={() => {
			dispatch("hide")
		}}
		transition:fade={{ duration: 250 }}
		data-testid="modal"
	>
		<div
			class="bg-grey-600/50 rounded-2xl border border-grey-400 z-50 w-[30rem] p-8 backdrop-blur-lg shadow-2xl shadow-black/50
	{$$props.class}"
		>
			<slot><span class="text-red-500">Nothing provided</span></slot>
		</div>
	</div>
{/if}
