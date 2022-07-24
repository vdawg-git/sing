export function reduceTitlesToFolders(
  titles: (string | undefined)[]
): number[] {
  // eslint-disable-next-line unicorn/no-array-reduce
  const folders = titles.reduce((accumulator, title) => {
    if (title === undefined) {
      console.error("title is undefined")
      return accumulator
    }

    const folder = Number(title.at(0))

    if (!accumulator.includes(folder)) accumulator.push(folder)

    return accumulator
  }, [] as number[])

  return folders
}

export function isMediaElement(
  element: HTMLElement | SVGElement
): element is HTMLMediaElement {
  if (element.nodeName === "AUDIO") return true
  if (element.nodeName === "VIDEO") return true

  return false
}
