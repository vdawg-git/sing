import { vi } from "vitest"

const mockedFS = {
  readFileSync: vi.fn().mockReturnValue(`mockedFS value`),
  existsSync: vi.fn().mockReturnValue(true),
}

export default mockedFS
