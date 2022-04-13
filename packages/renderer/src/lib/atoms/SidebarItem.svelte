<script lang="ts">
	export let calllback: Function
	export let marginBottom = "0"
	let activeState = false
</script>

<div on:click={() => calllback} style="margin-bottom: {marginBottom}rem; ">
	<div
		class="
    p-3 rounded-xl flex align-middle cursor-pointer active:bg-grey-500 
		-ml-2
    {!activeState && 'hover:bg-grey-700 '} 
    {activeState && 'bg-grey-600'}"
	>
		<slot name="icon" />
		<slot name="text">No Text provided</slot>
	</div>
</div>

<style>
</style>
