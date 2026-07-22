import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function resetAdmin() {
  try {
    await prisma.adminUser.delete({
      where: { id: 'singleton' }
    })
    console.log("✅ AdminUser deleted successfully.")
  } catch (e: any) {
    if (e.code === 'P2025') {
      console.log("✅ AdminUser was already deleted or doesn't exist.")
    } else {
      console.error("❌ Error deleting AdminUser:", e)
    }
  } finally {
    await prisma.$disconnect()
  }
}

resetAdmin()
