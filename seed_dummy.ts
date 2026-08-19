import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const dummyUsername = "guru_dummy@kuttab.com";

  // Clean up existing dummy data
  const existingUser = await prisma.user.findUnique({
    where: { username: dummyUsername },
    include: { classes: { include: { students: true } } }
  });

  if (existingUser) {
    console.log("Removing existing dummy data...");
    for (const c of existingUser.classes) {
      for (const s of c.students) {
        await prisma.depositLog.deleteMany({ where: { studentId: s.id } });
      }
      await prisma.student.deleteMany({ where: { classId: c.id } });
    }
    await prisma.class.deleteMany({ where: { teacherId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  console.log("Creating dummy user...");
  const dummyUser = await prisma.user.create({
    data: {
      name: "Guru Dummy",
      username: dummyUsername,
      password: "password123", // Plain text is supported per loginAction
      role: "GURU",
      mustChangePassword: false,
    }
  });

  console.log("Creating dummy class...");
  const dummyClass = await prisma.class.create({
    data: {
      name: "Kelas Dummy",
      teacherId: dummyUser.id,
    }
  });

  console.log("Creating dummy student...");
  const dummyStudent = await prisma.student.create({
    data: {
      name: "Siswa Dummy",
      classId: dummyClass.id,
      statusTilawah: "Iqra",
      totalJuz: 0,
      isActive: true,
      juzTasmi: "Belum Tasmi'",
    }
  });

  console.log("Creating dummy deposit logs...");
  // Create some recent deposit logs
  await prisma.depositLog.createMany({
    data: [
      {
        studentId: dummyStudent.id,
        category: "TAHFIZH_JADID",
        bookType: "AL-QURAN",
        sourceMaterial: "Al-Fatihah",
        startDetail: "Ayat 1",
        endDetail: "Ayat 7",
        grade: "Lancar",
      },
      {
        studentId: dummyStudent.id,
        category: "TILAWAH",
        bookType: "IQRA",
        sourceMaterial: "Jilid 3",
        startDetail: "Halaman 15",
        grade: "Lancar",
      },
    ]
  });

  console.log("Dummy data successfully created!");
  console.log("-----------------------------------------");
  console.log("Username :", dummyUsername);
  console.log("Password : password123");
  console.log("-----------------------------------------");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
