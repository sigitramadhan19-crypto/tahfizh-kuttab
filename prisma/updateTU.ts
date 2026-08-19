import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Updating Staff TU roles...');

  const users = await prisma.user.findMany();

  let updatedCount = 0;
  for (const user of users) {
    const nameLower = user.name.toLowerCase();
    if (nameLower.includes('nayla') || nameLower.includes('kharisma') || nameLower.includes('nurul')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'STAFF_TU' }
      });
      console.log(`✅ Updated ${user.name} to STAFF_TU`);
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} users to Staff TU.`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
