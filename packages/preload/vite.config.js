import { chrome } from "../../.electron-vendors.cache.json"
import { builtinModules } from "module"
import { join } from "path"

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
      "@sing-backend": join(PACKAGE_ROOT, "../backend/src") + "/",
      "@sing-main": join(PACKAGE_ROOT, "..", "main", "src") + "/",
      "@sing-types": join(PACKAGE_ROOT, "..", "..", "types") + "/",
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
        "music-metadata",
        "fs",
        "fs/promises",
        "path",
        "electron-updater",
        "original-fs",
        "prisma",
        "@sing-main/lib/Crud",
        ...builtinModules.flatMap((p) => [p, `node:${p}`]),
      ],
      output: {
        entryFileNames: "[name].cjs",
      },
    },
    emptyOutDir: true,
    brotliSize: false,
    define: {
      "import.meta.vitest": "undefined",
    },
  },
}

export default config
