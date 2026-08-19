import 'dotenv/config';
import { prisma } from './src/lib/prisma';
async function main() {
  const tkB1ClassId = 'cmse5fnw1000ak0u6ul6dzdjs';
  const tkB2ClassId = 'cmse5fo2y000fk0u6t5rup5ys';
  
  const santiId = 'cmse5fnul0009k0u63t0hbr27';
  const salsabilaId = 'cmse5fo1j000ek0u6ap34bwhm';

  // Update TK-B1 to Salsabila
  await prisma.class.update({
    where: { id: tkB1ClassId },
    data: { teacherId: salsabilaId }
  });

  // Update TK-B2 to Santi
  await prisma.class.update({
    where: { id: tkB2ClassId },
    data: { teacherId: santiId }
  });

  console.log("Successfully swapped wali kelas untuk TK-B1 dan TK-B2.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
