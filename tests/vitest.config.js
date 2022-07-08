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
