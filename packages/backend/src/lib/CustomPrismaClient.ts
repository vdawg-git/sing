import { PrismaClient } from "@prisma/client"

export function createPrismaClient(databasePath: string) {
  const client = new PrismaClient({
    datasources: {
      db: { url: databasePath },
    },
  })

  return client
}
