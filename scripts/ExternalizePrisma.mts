import type { Plugin } from "esbuild"

// See https://github.com/evanw/esbuild/issues/456#issuecomment-739735960
export const externalizePrisma: Plugin = {
  name: "externalize-prisma",
  setup(bundle) {
    bundle.onResolve({ filter: /@sing-prisma/ }, (_) => {
      // const prismaPath = join(
      //   process.cwd(),
      //   "dist",
      //   "generated",
      //   "prismaClient"
      // )
      // const path = relative(argument_.resolveDir, prismaPath)
      console.log("")
      return {
        path: "../../generated/client",
        external: true,
      }
    })
  },
}
