import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Reverting Bella Kharisma to GURU role...');

  const updatedUser = await prisma.user.updateMany({
    where: { name: { contains: 'Bella Kharisma' } },
    data: { role: 'GURU' }
  });

  console.log(`✅ Updated ${updatedUser.count} user(s) to GURU.`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
