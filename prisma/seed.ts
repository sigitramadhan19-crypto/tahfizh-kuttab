import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function main() {
  // Clear existing data for a clean slate
  await prisma.depositLog.deleteMany()
  await prisma.student.deleteMany()
  await prisma.class.deleteMany()
  await prisma.user.deleteMany()

  // Create Teachers
  const guru1A = await prisma.user.create({
    data: {
      name: 'Ustadz Ahmad (Wali 1A)',
      username: 'guru_1a',
      password: 'password',
      role: 'GURU',
    },
  })

  const guru1B = await prisma.user.create({
    data: {
      name: 'Ustadzah Fatimah (Wali 1B)',
      username: 'guru_1b',
      password: 'password',
      role: 'GURU',
    },
  })

  // Create Classes
  const class1A = await prisma.class.create({
    data: {
      name: 'Kelas 1A',
      teacherId: guru1A.id,
    },
  })

  const class1B = await prisma.class.create({
    data: {
      name: 'Kelas 1B',
      teacherId: guru1B.id,
    },
  })

  // Create Students for 1A
  const students1A = ['Ahmad Zaid', 'Budi Santoso', 'Umar Al-Faruq', 'Khadijah', 'Aisyah']
  for (const name of students1A) {
    await prisma.student.create({
      data: {
        name,
        classId: class1A.id,
      },
    })
  }

  // Create Students for 1B
  const students1B = ['Hasan', 'Husein', 'Fatimah Az-Zahra', 'Zainab', 'Ali']
  for (const name of students1B) {
    await prisma.student.create({
      data: {
        name,
        classId: class1B.id,
      },
    })
  }

  console.log('Database seeded successfully!')
  console.log('You can login with username: guru_1a or guru_1b (password: password)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
