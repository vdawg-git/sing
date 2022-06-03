import { fireEvent, render } from "@testing-library/svelte"
import type { SvelteComponentDev } from "svelte/internal"
import { beforeEach, expect, it, vi } from "vitest"
import { TEST_IDS as id } from "../src/Consts"
import "./setupBasicMocks"

let VolumeControl: typeof SvelteComponentDev

beforeEach(async () => {
  VolumeControl = (await import(
    "@/lib/molecules/VolumeControl.svelte"
  )) as unknown as typeof SvelteComponentDev
})

afterEach(async () => {
  vi.resetModules()
})

it("changes the icon on click", async () => {
  const component = render(VolumeControl)

  const oldIcon = component.getByTestId(id.playbarVolumeIcon)

  await fireEvent.click(oldIcon)

  const newIcon = component.getByTestId(id.playbarVolumeIcon)

  expect(newIcon).not.toBe(oldIcon)
})

it("sets the internal volume value to zero on click", async () => {
  const dom = render(VolumeControl, {
    props: { value: 100 },
  })

  const $$ = dom.component.$$

  await fireEvent.click(dom.getByTestId(id.playbarVolumeIcon))

  const newVolume = $$.ctx[$$.props["value"]]

  expect(newVolume).toBe(0)
})
