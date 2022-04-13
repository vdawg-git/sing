import FolderButton from "./FolderButton.svelte"
import { render, screen } from "@testing-library/svelte"

it("should render the add folder button if provided path is empty", () => {
	render(FolderButton, {
		path: "",
	})

	const addButton = screen.findByTestId("addFolderButton")

	expect(addButton).toBeTruthy()
})
