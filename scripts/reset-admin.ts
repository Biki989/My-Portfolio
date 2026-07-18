import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
