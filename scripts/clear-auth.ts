import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function resetAuth() {
  try {
    // Delete the rate limit logs
    await prisma.loginAttempt.deleteMany({})
    console.log("✅ Cleared rate limit history.")
    
    // Delete the admin user so it gets re-seeded
    await prisma.adminUser.delete({
      where: { id: 'singleton' }
    })
    console.log("✅ AdminUser deleted successfully. It will be recreated on next login.")
  } catch (e: any) {
    if (e.code === 'P2025') {
      console.log("✅ AdminUser was already deleted or doesn't exist.")
    } else {
      console.error("❌ Error:", e)
    }
  } finally {
    await prisma.$disconnect()
  }
}

resetAuth()
