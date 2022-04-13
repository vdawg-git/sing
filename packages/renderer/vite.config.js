/* eslint-env node */

import { chrome } from "../../.electron-vendors.cache.json"
import { join } from "path"
import { builtinModules } from "module"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import Icons from "unplugin-icons/vite"
import WindiCSS from "vite-plugin-windicss"
import { promises as fs } from "fs"
import { FileSystemIconLoader } from "unplugin-icons/loaders"

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
      "@/": join(PACKAGE_ROOT, "src") + "/",
      "@sharedTypes/*": join(PACKAGE_ROOT, "..", "..", "types") + "/",
    },
  },
  plugins: [
    WindiCSS(),
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
    svelte(),
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
  test: {
    environment: "happy-dom",
  },
}

export default config
