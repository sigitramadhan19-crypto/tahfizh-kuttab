import { prisma } from '../src/lib/prisma'
import * as xlsx from 'xlsx'
import * as path from 'path'

async function main() {
  console.log('Starting data import from Excel...');

  const filePath = path.join(__dirname, '..', 'asset', 'Data guru dan siswa kuttab Agus 2026.xlsx');
  const workbook = xlsx.readFile(filePath);

  // 1. Parse Sheet 1 (Guru)
  const sheet1Name = workbook.SheetNames[0];
  const gurus = xlsx.utils.sheet_to_json<any>(workbook.Sheets[sheet1Name]);
  
  for (const guru of gurus) {
    const role = guru.Jabatan?.toLowerCase() === 'kepsek' ? 'KEPALA_SEKOLAH' : 'GURU';
    const passwordStr = guru.Password ? guru.Password.toString() : '123456';

    const user = await prisma.user.upsert({
      where: { username: guru.Username },
      update: {
        name: guru.Nama,
        password: passwordStr,
        role: role,
      },
      create: {
        name: guru.Nama,
        username: guru.Username,
        password: passwordStr,
        role: role,
      }
    });

    // If their Jabatan is a class (e.g., "Kelas 1A"), create the class
    if (role === 'GURU' && guru.Jabatan) {
      const className = guru.Jabatan;
      
      // Check if class exists
      const existingClass = await prisma.class.findFirst({
        where: { name: className }
      });

      if (!existingClass) {
        await prisma.class.create({
          data: {
            name: className,
            teacherId: user.id
          }
        });
      } else {
        await prisma.class.update({
          where: { id: existingClass.id },
          data: { teacherId: user.id }
        });
      }
    }
  }
  console.log(`✅ Processed ${gurus.length} teachers and classes.`);

  // 2. Parse Sheet 2 (Siswa)
  const sheet2Name = workbook.SheetNames[1];
  const siswas = xlsx.utils.sheet_to_json<any>(workbook.Sheets[sheet2Name]);

  // To optimize, fetch all classes into a map
  const allClassRecords = await prisma.class.findMany();
  const classMap = new Map();
  for (const c of allClassRecords) {
    classMap.set(c.name.toLowerCase().trim(), c.id);
  }

  let studentCount = 0;
  for (const siswa of siswas) {
    const className = siswa.Kelas?.toLowerCase().trim();
    if (!className) continue;

    const classId = classMap.get(className);
    if (!classId) {
      console.warn(`⚠️ Warning: Class "${siswa.Kelas}" not found for student "${siswa.Nama}". Skipping.`);
      continue;
    }

    // Upsert student based on name and class to avoid duplicates
    const existingStudent = await prisma.student.findFirst({
      where: { name: siswa.Nama, classId: classId }
    });

    if (!existingStudent) {
      await prisma.student.create({
        data: {
          name: siswa.Nama,
          classId: classId
        }
      });
    }
    studentCount++;
  }

  console.log(`✅ Processed ${studentCount} students.`);
  console.log('🎉 Import completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
