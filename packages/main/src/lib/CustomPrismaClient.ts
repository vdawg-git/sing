import { dbURL } from "@/Consts"
import { PrismaClient } from "@prisma/client"

export default function createPrismaClient() {
  const client = new PrismaClient({
    datasources: {
      db: { url: dbURL },
    },
  })
  return client
}
