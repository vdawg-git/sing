import { vi } from "vitest"
import type { IElectronPaths } from "@sing-types/Types"
import { mockBasePath } from "@tests/helper/Consts"

export const app = {
  getPath: vi.fn((location: IElectronPaths) => mockBasePath + location + "/"),
}
