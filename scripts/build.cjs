const { join } = require("node:path")

const { build } = require("esbuild")
const replace = require("replace-in-file")

// See https://github.com/evanw/esbuild/issues/456#issuecomment-739735960
const externalizePrisma = {
  name: "externalize-prisma",
  setup(bundle) {
    bundle.onResolve({ filter: /@sing-prisma/ }, (_) => {
      // const prismaPath = join(
      //   process.cwd(),
      //   "dist",
      //   "generated",
      //   "prismaClient"
      // )
      // const path = relative(argument_.resolveDir, prismaPath)
      console.log("")
      return {
        path: "../../generated/client",
        external: true,
      }
    })
  },
}

build({
  entryPoints: [
    "./packages/backend/src/index.ts",
    "./packages/main/src/index.ts",
    "./packages/main/src/preload.ts",
  ],
  format: "cjs",
  platform: "node",
  bundle: true,
  write: true,
  outdir: "./dist",
  outExtension: { ".js": ".cjs" },
  sourcemap: "linked",
  keepNames: true,
  // "./packages/generated/*"
  external: ["electron"],
  plugins: [externalizePrisma],
}).then(() => {
  const mainPath = join(__dirname, "..", "dist", "main", "src", "index.cjs")
  console.log("Patching file for prisma:", mainPath)

  const results = replace.sync({
    files: mainPath,
    from: /"use strict";/,
    to: `"use strict";
    //### Inserted by build.cjs to point the backend (a child process) to Prisma
    process.env['prismaClientPath'] = require("path").join(
      require('electron').app.getAppPath(),
      ".." , "..", "generated", "client"
    );
    //##########################################################################`,
  })

  console.log("Patched main.cjs for Prisma \n", results)
})
