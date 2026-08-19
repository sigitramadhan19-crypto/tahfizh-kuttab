import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("Membuat akun guru dummy...");

  // Cek apakah guru dummy sudah ada
  let guru = await prisma.user.findUnique({
    where: { username: 'guru_dummy' }
  });

  if (!guru) {
    guru = await prisma.user.create({
      data: {
        name: 'Guru Dummy',
        username: 'guru_dummy',
        password: '123456', // Bisa plain text, karena fallback login mensupport plain text
        role: 'GURU',
        mustChangePassword: false, // Bypass force password change
      }
    });
    console.log("Akun Guru Dummy dibuat: Username: guru_dummy, Password: 123456");
  } else {
    console.log("Akun Guru Dummy sudah ada. Mereset status...");
    await prisma.user.update({
      where: { username: 'guru_dummy' },
      data: { mustChangePassword: false, password: '123456' }
    });
  }

  // Cek apakah Kelas Dummy sudah ada
  let kelas = await prisma.class.findFirst({
    where: { name: 'Kelas Uji Coba', teacherId: guru.id }
  });

  if (!kelas) {
    kelas = await prisma.class.create({
      data: {
        name: 'Kelas Uji Coba',
        teacherId: guru.id,
      }
    });
    console.log("Kelas Uji Coba dibuat.");
  }

  // Buat 3 siswa dummy yang datanya SUDAH LENGKAP (statusTilawah dan totalJuz terisi)
  // Ini mem-bypass paksaan pengisian data awal siswa.
  const siswaNames = ["Ahmad Dummy", "Budi Dummy", "Citra Dummy"];
  for (const name of siswaNames) {
    const s = await prisma.student.findFirst({ where: { name, classId: kelas.id } });
    if (!s) {
      await prisma.student.create({
        data: {
          name,
          classId: kelas.id,
          isActive: true,
          statusTilawah: "Al-Quran",
          totalJuz: Math.floor(Math.random() * 5) + 1, // 1-5 juz
          juzTasmi: "Belum Tasmi'",
        }
      });
      console.log(`Siswa dummy ${name} dibuat dengan data lengkap.`);
    }
  }

  console.log("Selesai!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
