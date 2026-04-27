import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@ccir-campus.re';
  const adminPassword = 'erer';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({ data: { email: adminEmail, password: hashedPassword, role: 'admin' } });
    console.log('Admin créé');
  } else {
    console.log('Admin déjà existant');
  }

  const userTestEmail = 'usertest@ccir-campus.re';
  const userTestPassword = 'erer';
  const existingUserTest = await prisma.user.findUnique({ where: { email: userTestEmail } });

  if (!existingUserTest) {
    const hashedPassword = await bcrypt.hash(userTestPassword, 10);
    await prisma.user.create({ data: { email: userTestEmail, password: hashedPassword, role: 'userTest' } });
    console.log('userTest créé');
  } else {
    console.log('userTest déjà existant');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => { await prisma.$disconnect(); });
