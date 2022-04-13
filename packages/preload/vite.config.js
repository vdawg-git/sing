import { chrome } from "../../.electron-vendors.cache.json"
import { builtinModules } from "module"
import { join } from "path"

const PACKAGE_ROOT = __dirname
console.warn(join(PACKAGE_ROOT, "../main/src") + "\\")
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
      "@/": join(PACKAGE_ROOT, "src") + "/",
      "@main/": join(PACKAGE_ROOT, "../main/src") + "/",
    },
  },
  build: {
    sourcemap: "inline",
    target: `chrome${chrome}`,
    outDir: "dist",
    assetsDir: ".",
    minify: process.env.MODE !== "development",
    lib: {
      entry: "src/index.ts",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: [
        "electron",
        "@prisma",
        "@prisma/client",
        "electron-store",
        "@main/lib/Sync",
        "music-metadata",
        "@main/*",
        "chalk",
        "stream",
        "strtok3",
        "fs",
        "fs/promises",
        "path",
        "@main/lib/Sync",
        "electron-updater",
        "original-fs",
        ...builtinModules.flatMap((p) => [p, `node:${p}`]),
      ],
      output: {
        entryFileNames: "[name].cjs",
      },
    },
    emptyOutDir: true,
    brotliSize: false,
  },
}

export default config
