import { node } from "../../.electron-vendors.cache.json"
import { join } from "path"
import { builtinModules } from "module"

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
      "@sing-renderer/*":
        join(PACKAGE_ROOT, "..", "packages", "renderer", "src") + "/",
      "@sing-main/*": join(PACKAGE_ROOT, "..", "packages", "main", "src") + "/",
      "@sing-preload/*":
        join(PACKAGE_ROOT, "..", "packages", "preload", "src") + "/",
      "@": join(PACKAGE_ROOT) + "/",
    },
  },
  build: {
    sourcemap: "inline",
    target: `node${node}`,
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
        "electron-devtools-installer",
        "@prisma/client",
        "electron-store",
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
