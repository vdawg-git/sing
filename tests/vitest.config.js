import { join } from "path"

const PACKAGE_ROOT = __dirname

const x = [
  join(PACKAGE_ROOT, "..", "packages", "renderer", "src") + "/",
  join(PACKAGE_ROOT, "..", "packages", "main", "src") + "/",
  join(PACKAGE_ROOT, "..", "packages", "preload", "src") + "/",
  join(PACKAGE_ROOT, "..", "types") + "/",
]

console.log(x)

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
      "@sing-types/*": join(PACKAGE_ROOT, "..", "types") + "/",
      "@": join(PACKAGE_ROOT) + "/",
    },
  },
}

export default config
