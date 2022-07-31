const { writeFile } = require("node:fs/promises")
const { execSync } = require("node:child_process")
const electron = require("node:electron")
const path = require("node:path")

/**
 * Returns versions of electron vendors
 * The performance of this feature is very poor and can be improved
 * @see https://github.com/electron/electron/issues/28006
 *
 * @returns {NodeJS.ProcessVersions}
 */
function getVendors() {
  const output = execSync(`${electron} -p "JSON.stringify(process.versions)"`, {
    env: { ELECTRON_RUN_AS_NODE: "1" },
    // eslint-disable-next-line unicorn/text-encoding-identifier-case
    encoding: "utf-8",
  })

  return JSON.parse(output)
}

function updateVendors() {
  const electronRelease = getVendors()

  const nodeMajorVersion = electronRelease.node.split(".")[0]
  const chromeMajorVersion = electronRelease.v8.split(".").splice(0, 2).join("")

  const browserslistrcPath = path.resolve(process.cwd(), ".browserslistrc")

  return Promise.all([
    writeFile(
      "./.electron-vendors.cache.json",
      `${JSON.stringify(
        {
          chrome: chromeMajorVersion,
          node: nodeMajorVersion,
        },
        null,
        2
      )}\n`
    ),

    writeFile(browserslistrcPath, `Chrome ${chromeMajorVersion}\n`, "utf8"),
  ])
}

updateVendors().catch((error) => {
  console.error(error)
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
})
