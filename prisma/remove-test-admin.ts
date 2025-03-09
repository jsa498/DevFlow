import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeTestAdmin() {
  try {
    await prisma.user.delete({
      where: {
        email: 'admin@example.com',
      },
    })
    console.log('Successfully removed test admin user')
  } catch (error) {
    console.error('Error removing test admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeTestAdmin() 