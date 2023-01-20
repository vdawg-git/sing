import { TEST_IDS } from "@sing-renderer/TestConsts"

import type { Locator } from "playwright"
import type { StrictOmit } from "ts-essentials"

export const LOCATOR = Object.entries(TEST_IDS.asQuery).reduce(
  (accumulator, [key, value]) => ({
    ...accumulator,
    [key]: Locato,
  }),
  {} as Record<keyof StrictOmit<typeof TEST_IDS, "asQuery">, Locator>
)
