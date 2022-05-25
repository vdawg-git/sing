import { Page } from "playwright"
import createParentPage from "./Base"

export default function createTracksPage(page: Page) {
  return { ...createParentPage(page) }
}
