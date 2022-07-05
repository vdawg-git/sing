import { vi } from "vitest"
import type { electronPaths } from "@sing-types/Types"
import { mockedBase } from "./fs"

export const app = {
  getPath: vi.fn((location: electronPaths) => mockedBase + location + "/"),
}
