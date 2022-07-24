import { secondsToDuration } from "@/Helper"

describe("secondsToDuration", async () => {
  it("outputs the correct time", async () => {
    const seconds = 124.007_865_767_96
    const desiredResult = "2:04"

    expect(secondsToDuration(seconds)).toEqual(desiredResult)
  })
})
