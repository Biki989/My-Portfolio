import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
