import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function checkAdmin() {
  try {
    const admin = await prisma.adminUser.findUnique({ where: { id: 'singleton' } })
    if (admin) {
      console.log("✅ AdminUser exists! Username:", admin.username)
    } else {
      console.log("❌ AdminUser DOES NOT EXIST in the database.")
    }
  } catch (e) {
    console.error("Error:", e)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
