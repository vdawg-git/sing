<script lang="ts">
	import IconPlusCircle from "virtual:icons/heroicons-solid/plus-circle"
	import Modal from "./Modal.svelte"
	import FoldersPicker from "./FoldersPicker.svelte"
	import Button from "../atoms/Button.svelte"
	import { onMount } from "svelte"

	let showModal = false
	let paths: string[]

	onMount(
		async () =>
			(paths = (await window.api.getUserSetting("musicFolders")) || [])
	)
</script>

<div class="h-full flex items-center justify-center mt-20">
	<div
		on:click={() => {
			console.log("Clicked")
			showModal = true
		}}
		class="w-full flex flex-col justify-center items-center cursor-pointer group grow text-grey-300 hover:text-white transition-colors ease-in-out"
	>
		<IconPlusCircle
			class="w-20 h-20 mb-8 text-grey-300 group-hover:text-grey-100 transition-colors ease-in-out"
		/>
		<p class="grow max-w-md">
			It is pretty empty right now. Start adding some folders to sync them with
			your library by clicking here.
		</p>
	</div>
</div>

<Modal show={showModal} on:hide={() => (showModal = false)}>
	<div class="min-h-[18rem]">
		<h1 class="text-xl mb-2">Add folders</h1>
		<p class="mb-6 text-grey-300">
			Choose which folders you want to sync with your library
		</p>
		<FoldersPicker bind:paths />
	</div>
	<Button
		text="Save and sync"
		minHeight={480}
		class="w-full"
		on:click={async () => {
			if (paths === undefined || paths.length === 0) return
			console.log(await window.api.setUserSettings("musicFolders", paths))
			showModal = false
			window.api.sync()
		}}
	/>
</Modal>
