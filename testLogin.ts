import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'STAFF_TU' }
    });
    users.forEach(u => console.log(`Name: ${u.name} | Username: ${u.username} | Password: ${u.password}`));
  } catch (e) {
    console.error("Prisma error:", e);
  }
}

main();
