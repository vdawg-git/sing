<script lang="ts">
	import type { OpenDialogOptions, OpenDialogReturnValue } from "electron"
	import IconFolderRemove from "virtual:icons/heroicons-outline/folder-remove"
	import IconFolderAdd from "virtual:icons/heroicons-outline/folder-add"
	import IconEdit from "virtual:icons/heroicons-outline/pencil"
	import { createEventDispatcher } from "svelte"
	import { truncatePath } from "@/Helper"

	export let path = ""

	const dispatch = createEventDispatcher()

	async function pickFolder() {
		const params: OpenDialogOptions = {
			properties: ["openDirectory"],
		}
		const { filePaths: folderPaths, canceled } =
			await window.api.openMusicFolder()

		if (canceled || folderPaths.length === 0) return false

		return folderPaths
	}

	async function addFolder() {
		const folderPaths = await pickFolder()
		if (folderPaths === false) return

		dispatch("folderAdded", folderPaths)
	}

	async function removeFolder() {
		dispatch("folderRemoved", path)
		path = ""
	}

	async function editFolder() {
		console.log("Button edit folder event")
		const newPaths = await pickFolder()
		if (newPaths === false) return

		dispatch("folderEdited", { oldPath: path, newPaths })
	}
</script>

{#if path === ""}
	<button
		class="
			h-12  px-3
			flex  w-full place-content-between  items-center
			border border-grey-300
			text-left rounded-xl
		hover:text-white hover:border-grey-200
			transition-colors duration-100 ease-out
			{$$props.class}
			"
		on:click={() => addFolder()}
		data-testid="addFolderButton"
	>
		<p>Add folder…</p>
		<IconFolderAdd class="h-6 w-6 " />
	</button>
{:else}
	<div class="flex {$$props.class}" data-testid="editFolderWrapper">
		<button
			class="
				h-12  px-3
				flex  w-full place-content-between  items-center
				border border-grey-300
				text-left rounded-tl-xl rounded-bl-xl
			hover:text-white hover:border-grey-200
				transition-colors duration-100 ease-out"
			on:click={() => editFolder()}
			><p class="">{truncatePath(path, 35)}</p>
			<IconEdit class="h-6 w-6 " /></button
		>

		<div
			class="
			w-12 h-12 
			flex items-center justify-center
			grow-0 hover:text-red-300 
			rounded-tr-xl rounded-br-xl 
			border-y border-r border-grey-300
			"
			on:click={() => removeFolder()}
		>
			<IconFolderRemove class="h-6 w-6 " />
		</div>
	</div>
{/if}
