import 'dotenv/config';
import { prisma } from './src/lib/prisma';
async function main() {
  const users = await prisma.user.findMany();
  const classes = await prisma.class.findMany({
    include: {
      teacher: true,
    }
  });
  const studentsSanti = await prisma.student.findMany({
    where: { classId: 'cmse5fo2y000fk0u6t5rup5ys' }
  });
  console.log("Students in Santi's class:");
  console.log(studentsSanti.map(s => `${s.name} (Active: ${s.isActive})`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
