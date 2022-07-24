import { builtinModules } from "module"
import { join } from "path"

import { node } from "../../.electron-vendors.cache.json"

const PACKAGE_ROOT = __dirname

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  resolve: {
    alias: {
      "@": join(PACKAGE_ROOT, "src") + "/",
      "@tests": join(PACKAGE_ROOT, "tests") + "/",
      "@sing-types": join(PACKAGE_ROOT, "..", "..", "types") + "/",
      "@sing-main": join(PACKAGE_ROOT, "..", "main", "src") + "/",
      "@sing-preload": join(PACKAGE_ROOT, "..", "preload", "src") + "/",
    },
  },
  build: {
    sourcemap: "inline",
    target: `node${node}`,
    outDir: "dist",
    assetsDir: ".",
    minify: false,
    lib: {
      entry: "src/index.ts",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: [
        "@prisma/client",
        "ololog",
        ...builtinModules.flatMap((p) => [p, `node:${p}`]),
      ],
      output: {
        entryFileNames: "[name].cjs",
      },
    },
    emptyOutDir: true,
    brotliSize: false,
  },
  define: {
    "import.meta.vitest": "undefined",
  },
  test: {
    includeSource: ["src/**/*.ts"],
  },
}

export default config
