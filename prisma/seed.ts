import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Example seed: create admin row if not exists
  const adminId = process.env.SUPABASE_ADMIN_ID
  if (adminId) {
    await prisma.admins.upsert({
      where: { id: adminId },
      update: {},
      create: { id: adminId }
    })
    console.log('Admin seeded:', adminId)
  } else {
    console.log('No SUPABASE_ADMIN_ID provided, skipping admin seed')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
