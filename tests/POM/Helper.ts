export function reduceTitlesToFolders(
  titles: (string | undefined)[]
): number[] {
  const folders = titles.reduce((acc, title) => {
    if (title === undefined) {
      console.error("title is undefined")
      return acc
    }

    const folder = Number(title.at(0))

    if (acc.indexOf(folder) === -1) acc.push(folder)

    return acc
  }, [] as number[])

  return folders
}
