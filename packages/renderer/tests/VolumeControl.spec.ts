import "./setupBasicMocks"

import { TEST_IDS as id } from "@/TestConsts"
import { fireEvent, render } from "@testing-library/svelte"
import { beforeEach, expect, it, vi } from "vitest"

import type { SvelteComponentDev } from "svelte/internal"

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
  const dom = render(VolumeControl, { value: 1 })

  const button = dom.getByTestId(id.playbarVolumeIcon)
  const oldHtml = dom.container.innerHTML

  await fireEvent.click(button)

  const newHtml = dom.container.innerHTML

  expect(newHtml).not.toEqual(oldHtml)
})

it("sets the internal volume value to zero on click", async () => {
  const dom = render(VolumeControl, {
    props: { value: 1 },
  })

  const { $$ } = dom.component
  const oldVolume = $$.ctx[$$.props.value]

  await fireEvent.click(dom.getByTestId(id.playbarVolumeIcon))

  const newVolume = $$.ctx[$$.props.value]

  expect(oldVolume).toBe(1)
  expect(newVolume).toBe(0)
})

it("restores the previous volume when clickong on the muted icon", async () => {
  const dom = render(VolumeControl, {
    props: { value: 1 },
  })

  const { $$ } = dom.component
  const oldVolume = $$.ctx[$$.props.value]

  await fireEvent.click(dom.getByTestId(id.playbarVolumeIcon))
  await fireEvent.click(dom.getByTestId(id.playbarVolumeIcon))

  const newVolume = $$.ctx[$$.props.value]

  expect(newVolume).toBe(oldVolume)
})

it("sets the correct value for the volume on creation", async () => {
  const dom = render(VolumeControl, { value: 1 })

  const { $$ } = dom.component
  const volume = $$.ctx[$$.props.value]

  expect(volume).toBe(1)
})
