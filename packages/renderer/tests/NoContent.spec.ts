import { fireEvent, render, screen } from "@testing-library/svelte"
import NoContent from "@/lib/organisms/NoContent.svelte"
import { describe, expect, it } from "vitest"
import { TEST_IDS } from "@/TestConsts"
import MockedApi from "./MockElectronApi"

vi.stubGlobal("api", MockedApi)

describe("No Content page", () => {
  it("should render text", () => {
    const page = render(NoContent)

    expect(
      page.getByText(
        "It is pretty empty right now. Start adding some folders to sync them with your library by clicking here."
      )
    ).toBeTruthy()
  })

  it("does not show the modal on load", async () => {
    render(NoContent)

    expect(screen.queryByTestId(TEST_IDS.modal)).toBeNull()
  })

  it("opens modal when clicked", async () => {
    const page = render(NoContent)

    const button = page.getByTestId(TEST_IDS.noContentModalButton)
    expect(page.queryByTestId(TEST_IDS.modal)).toBeNull()

    await fireEvent.click(button)
    expect(page.getByTestId(TEST_IDS.modal)).toBeTruthy()
  })
})
