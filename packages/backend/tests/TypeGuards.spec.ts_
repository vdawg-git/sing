import { expect, test } from "vitest"

import { isICoverData } from "@/types/TypeGuards"

import type { FilePath } from "@sing-types/Filesystem"
import type { ICoverData } from "@/types/Types"

test("isICoverData happy", () => {
  const given: ICoverData = {
    md5: "coverMD5",
    path: "path" as FilePath,
    buffer: Buffer.from("coverBuffer"),
  }

  expect(isICoverData(given)).toBe(true)
})

test("isICoverData sad", () => {
  const given = {
    coverPath: "coverPath",
    coverBuffer: Buffer.from("coverBuffer"),
  }

  expect(isICoverData(given)).toBe(false)
})

test("isICoverData sad 2", () => {
  const given = {
    coverMD5: 1,
    coverPath: 2,
    coverBuffer: "3",
  }

  expect(isICoverData(given)).toBe(false)
})
