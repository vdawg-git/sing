import { Page } from "playwright"
import createBasePage from "./Base"

export default function createTracksPage(page: Page) {
  return { ...createBasePage(page) }
}
