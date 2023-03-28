/* eslint-disable unicorn/prefer-dom-node-text-content */

import { TEST_ATTRIBUTES, TEST_IDS } from "@sing-renderer/TestConsts"

import type { ElectronApplication, Locator } from "playwright"

export async function createMenuOrganism(electron: ElectronApplication) {
  const page = await electron.firstWindow()

  const menu = page.getByTestId(TEST_IDS.menu)
  const menuItems = menu.locator(TEST_ATTRIBUTES.asQuery.menuItem)

  return {
    addToExistingPlaylist,
    addToNewPlaylist,
    clickPlayLater,
    clickPlayNext,
    getItem,
    hasItem,
    menuLocator: menu,
  }

  async function addToExistingPlaylist(playlistName: string) {
    await clickItem("Add to playlist")
    await clickItem(playlistName)
  }

  async function addToNewPlaylist() {
    await clickItem("Add to playlist")
    await clickItem("Create new")
  }

  async function clickItem(label: string) {
    const item = getItem(label)

    await item.click()
  }

  function getItem(label: string): Locator {
    return menuItems.filter({ hasText: label })
  }

  async function hasItem(label: string): Promise<boolean> {
    return getItem(label).isVisible()
  }

  /**
   * Add to queue as "Play next"
   */
  async function clickPlayNext() {
    return getItem("Play next").click({ position: { x: 8, y: 8 } })
  }

  /**
   * Add to queue as "Play later"
   */
  async function clickPlayLater() {
    return getItem("Play later").click({ position: { x: 8, y: 8 } })
  }
}
