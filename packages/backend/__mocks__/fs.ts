import c from "ansicolor"

export const fs = {
  default() {
    throw new Error(
      `Use ${c.bgLightBlue("fs/promises")} over ${c.bgBlack("fs")}`
    )
  },
}
