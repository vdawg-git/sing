/* eslint-env node */

import { chrome } from "../../.electron-vendors.cache.json"
import { join } from "path"
import { builtinModules } from "module"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import Icons from "unplugin-icons/vite"
import { promises as fs } from "fs"

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
      "@": join(PACKAGE_ROOT, "src") + "/",
      "@sing-types": join(PACKAGE_ROOT, "..", "..", "types") + "/",
      "@sing-main": join(PACKAGE_ROOT, "..", "main", "src") + "/",
      "@sing-preload": join(PACKAGE_ROOT, "..", "preload", "src") + "/",
    },
  },
  plugins: [
    Icons({
      compiler: "svelte",
      customCollections: {
        custom: async (iconName) =>
          fs.readFile(
            join(__dirname, "assets", "icons", `${iconName}.svg`),
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
    outDir: "dist",
    assetsDir: ".",
    rollupOptions: {
      input: join(PACKAGE_ROOT, "index.html"),
      external: [...builtinModules.flatMap((p) => [p, `node:${p}`])],
    },
    emptyOutDir: true,
    brotliSize: false,
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

export default config
