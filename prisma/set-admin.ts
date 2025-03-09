import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'devflow.technologies@gmail.com';

  try {
    const updatedUser = await prisma.user.upsert({
      where: {
        email: adminEmail,
      },
      update: {
        role: 'ADMIN',
      },
      create: {
        email: adminEmail,
        name: 'DevFlow Admin',
        role: 'ADMIN',
      },
    });

    console.log('Admin user updated:', updatedUser);
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 