import { TEST_IDS as id } from "../src/Consts"
import { fireEvent, render, waitFor, screen } from "@testing-library/svelte"
import { beforeEach, describe, expect, it, vi } from "vitest"
import "./setupBasicMocks"
import type { SvelteComponentDev } from "svelte/internal"

let volumeControl: typeof SvelteComponentDev

beforeEach(async () => {
  volumeControl = (await import(
    "@/lib/molecules/VolumeControl.svelte"
  )) as unknown as typeof SvelteComponentDev
})

afterEach(async () => {
  vi.resetModules()
})

it("changes the icon on click", async () => {
  const component = render(volumeControl)

  const oldIcon = component.getByTestId(id.asQuery.playbarQueueIcon)

  await fireEvent.click(component.container)

  const newIcon = component.getByTestId(id.asQuery.playbarQueueIcon)

  expect(newIcon).not.toEqual(oldIcon)
})

it("sets the internal volume value to zero on click", async () => {
  const { component } = render(volumeControl, {
    volume: 100,
  })

  const oldVolume = component.$$.props.amount

  console.log(component.$$.props.amount)
  console.log(oldVolume)

  await fireEvent.click(component.container)

  const newVolume = component.$$.props.amount

  expect(newVolume).toBe(0)
})
