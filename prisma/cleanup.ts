import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Cleaning up dummy data...');

  // 1. Delete dummy students
  const dummyStudentNames = [
    'Ahmad Zaid', 'Budi Santoso', 'Umar Al-Faruq', 'Khadijah', 'Aisyah',
    'Hasan', 'Husein', 'Fatimah Az-Zahra', 'Zainab', 'Ali'
  ];

  // 1a. Delete deposit logs for dummy students
  const studentsToDelete = await prisma.student.findMany({
    where: { name: { in: dummyStudentNames } }
  });
  const studentIds = studentsToDelete.map(s => s.id);
  
  const deletedLogs = await prisma.depositLog.deleteMany({
    where: { studentId: { in: studentIds } }
  });
  console.log(`Deleted ${deletedLogs.count} dummy deposit logs.`);

  // 1b. Delete dummy students
  const deletedStudents = await prisma.student.deleteMany({
    where: {
      id: { in: studentIds }
    }
  });
  console.log(`Deleted ${deletedStudents.count} dummy students.`);

  // 2. Delete dummy teachers
  const dummyUsernames = ['guru_1a', 'guru_1b'];
  const deletedTeachers = await prisma.user.deleteMany({
    where: {
      username: { in: dummyUsernames }
    }
  });
  console.log(`Deleted ${deletedTeachers.count} dummy teachers.`);

  console.log('Cleanup completed successfully!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
