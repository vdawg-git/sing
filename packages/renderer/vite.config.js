/* eslint-env node */
import { promises as fs } from "node:fs"
import { builtinModules } from "node:module"
import path from "node:path"

import { svelte } from "@sveltejs/vite-plugin-svelte"
import Icons from "unplugin-icons/vite"

import { chrome } from "../../.electron-vendors.cache.json"

const PACKAGE_ROOT = __dirname

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      "@": `${path.join(PACKAGE_ROOT, "src")}/`,
      "@tests": `${path.join(PACKAGE_ROOT, "tests")}/`,
      "@sing-types": `${path.join(PACKAGE_ROOT, "..", "..", "types")}/`,
      "@sing-main": `${path.join(PACKAGE_ROOT, "..", "main", "src")}/`,
      "@sing-shared": `${path.join(PACKAGE_ROOT, "..", "shared")}/`,
    },
  },
  plugins: [
    Icons({
      compiler: "svelte",
      customCollections: {
        custom: async (iconName) =>
          fs.readFile(
            path.join(__dirname, "assets", "icons", `${iconName}.svg`),
            "utf8"
          ),
      },
    }),
    svelte({ hot: !process.env.VITEST }),
  ],
  base: "",
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: "../../dist/renderer/",
    assetsDir: ".",
    rollupOptions: {
      input: path.join(PACKAGE_ROOT, "index.html"),
      external: builtinModules.flatMap((p) => [p, `node:${p}`]),
    },
    emptyOutDir: true,
    brotliSize: false,
    minify: false,
  },
  optimizeDeps: { exclude: ["svelte-navigator"] },
  test: {
    environment: "jsdom",
    globals: true,
  },
  define: {
    "import.meta.vitest": "undefined",
  },
}

// eslint-disable-next-line import/no-default-export
export default config
