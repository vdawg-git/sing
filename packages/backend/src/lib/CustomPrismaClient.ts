import { PrismaClient } from "@sing-prisma"

console.log("Backend:", { dbURL: process.argv[2], qePath: process.argv[3] })

export const prisma = new PrismaClient({
  log: [
    "info",
    "warn",
    "error",
    //     {
    //     emit: "event",
    //     level: "query",
    // },
  ],
  datasources: {
    db: {
      url: process.argv[2],
    },
  },
  // see https://github.com/prisma/prisma/discussions/5200
  // @ts-expect-error
  __internal: {
    engine: {
      binaryPath: process.argv[3],
    },
  },
})
