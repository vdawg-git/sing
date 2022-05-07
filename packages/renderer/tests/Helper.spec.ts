import { secondsToDuration } from "@/Helper"

describe("secondsToDuration", async () => {
  it("outputs the correct time", async () => {
    const seconds = 124.00786576796
    const desiredResult = "2:04"

    expect(secondsToDuration(seconds)).toEqual(desiredResult)
  })
})
