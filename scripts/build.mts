import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { build } from "esbuild"
import replace from "replace-in-file"

import { externalizePrisma } from "./ExternalizePrisma.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))

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
