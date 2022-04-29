import { cleanup, fireEvent, render, screen } from "@testing-library/svelte"
import NoContent from "../src/lib/organisms/NoContent.svelte"
import { describe, expect, test } from "vitest"
import { testIDs } from "./Consts"
import MockedApi from "./MockElectronApi"

window.api = MockedApi

describe("No Content page", () => {
  test("should render text", () => {
    const page = render(NoContent)

    expect(
      page.getByText(
        "It is pretty empty right now. Start adding some folders to sync them with your library by clicking here."
      )
    ).toBeTruthy()
  })

  test("opens modal when clicked", async () => {
    const page = render(NoContent)

    const button = page.getByTestId(testIDs.noContentModalButton)
    await fireEvent.click(button)
    expect(page.getByTestId(testIDs.modal)).toBeTruthy()
  })
})
