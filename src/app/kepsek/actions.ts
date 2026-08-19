"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getStudentDepositLogs(studentId: string) {
  const sessionId = await getSession();
  if (!sessionId) {
    return { success: false, error: "Unauthorized" };
  }

  // Verifikasi role (opsional tapi baik untuk keamanan)
  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { role: true }
  });

  if (!user || (user.role !== "KEPALA_SEKOLAH" && user.role !== "STAFF_TU")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        depositLogs: {
          orderBy: { timestamp: "desc" }
        }
      }
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    return { 
      success: true, 
      data: {
        id: student.id,
        name: student.name,
        className: student.class.name,
        totalJuz: student.totalJuz,
        depositLogs: student.depositLogs
      } 
    };
  } catch (error) {
    console.error("Error fetching student logs:", error);
    return { success: false, error: "Terjadi kesalahan server" };
  }
}
