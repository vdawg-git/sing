// Taken from https://github.com/awohletz/electron-prisma-trpc-example/blob/main/copy-files.js

const path = require("node:path")

const fs = require("fs-extra")
const replace = require("replace-in-file")

// fix long prisma loading times caused by scanning from process.cwd(), which returns "/" when run in electron
// (thus it scans all files on the computer.) See https://github.com/prisma/prisma/issues/8484
const files = path.join(
  __dirname,
  "..",
  "packages",
  "generated",
  "client",
  "index.js"
)
console.log("looking at files", files)

/**
 * We replace the search by process.cwd(), with the lookup for a environment variable, which gets set in the index of the main process.
 */
const options = {
  files,
  from: /findSync\(process\.cwd\(\),.*\[0]/gs,
  to: `process.env["prismaClientPath"]`,
  dry: false,
}
// OLD OPTIONS
// const options = {
//   files,
//   from: "findSync(process.cwd()",
//   to: `findSync(require('electron').app.getAppPath()`,
// }

const results = replace.sync(options)
console.log("Replacement results:", results)

// Copy the generated prisma client to the dist folder
fs.copySync(
  path.join(__dirname, "..", "packages", "generated"),
  path.join(__dirname, "..", "dist", "generated"),
  {
    filter: (source, _destination) => {
      // Prevent duplicate copy of query engine. It will already be in extraResources in electron-builder.yml
      if (
        /query_engine/.test(source) ||
        /libquery_engine/.test(source) ||
        /esm/.test(source)
      ) {
        return false
      }
      return true
    },
  }
)
