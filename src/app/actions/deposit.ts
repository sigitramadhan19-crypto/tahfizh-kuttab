"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Category } from "@prisma/client";
import { getSession } from "@/lib/auth";

export async function getMyClassAndStudents() {
  try {
    const sessionId = await getSession();
    if (!sessionId) return { success: false, error: "Not logged in" };

    const teacher = await prisma.user.findUnique({
      where: { id: sessionId },
      include: { classes: true }
    });

    if (!teacher || teacher.classes.length === 0) {
      return { success: false, error: "Guru tidak memiliki kelas" };
    }

    // Assuming teacher has 1 class for now (wali kelas)
    const classId = teacher.classes[0].id;
    const students = await prisma.student.findMany({
      where: { classId, isActive: true },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: { class: teacher.classes[0], students } };
  } catch (error) {
    console.error("Failed to fetch my class:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function getStudentsByClass(classId: string) {
  try {
    const students = await prisma.student.findMany({
      where: { classId, isActive: true },
      include: {
        depositLogs: {
          orderBy: { timestamp: "desc" },
          take: 1,
        }
      }
    });
    return { success: true, data: students };
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return { success: false, error: "Gagal mengambil data siswa." };
  }
}

export async function getClassesByTeacher(teacherId: string) {
  try {
    const classes = await prisma.class.findMany({
      where: { teacherId },
    });
    return { success: true, data: classes };
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return { success: false, error: "Gagal mengambil data kelas." };
  }
}

export async function saveDepositLog(data: any) {
  try {
    let sourceMaterial = "";
    let startDetail = "";
    let endDetail = "";
    let bookType = "";

    if (data.category === "MURAJAAH") {
      bookType = data.murajaahType === "Baid" ? "MURAJAAH_BAID" : "MURAJAAH_QARIB";
      if (data.murajaahType === "Baid") {
        sourceMaterial = data.baidOption || "";
      } else {
        sourceMaterial = data.qaribSurahs?.join(", ") || "";
      }
    } else if (data.category === "TILAWAH") {
      bookType = data.tilawahType === "Iqra" ? "IQRA" : "AL-QURAN";
      if (data.tilawahType === "Iqra") {
        sourceMaterial = `Jilid ${data.jilid}`;
        startDetail = `Halaman ${data.halaman}`;
        if (data.barisStart) {
          endDetail = `Baris ${data.barisStart}`;
          if (data.barisEnd) {
            endDetail += `-${data.barisEnd}`;
          }
        }
      } else {
        sourceMaterial = data.surah || "";
        startDetail = `Ayat ${data.ayatStart}`;
        endDetail = data.ayatEnd ? `Ayat ${data.ayatEnd}` : "";
      }
    } else if (data.category === "TAHFIZH_JADID") {
      bookType = "AL-QURAN";
      sourceMaterial = data.surah || "";
      startDetail = `Ayat ${data.ayatStart}`;
      endDetail = data.ayatEnd ? `Ayat ${data.ayatEnd}` : "";
    }

    const newLog = await prisma.depositLog.create({
      data: {
        studentId: data.studentId,
        category: data.category as Category,
        bookType,
        sourceMaterial,
        startDetail,
        endDetail,
        grade: data.grade,
      },
    });

    revalidatePath("/");
    revalidatePath("/riwayat");
    return { success: true, data: newLog };
  } catch (error) {
    console.error("Failed to save deposit:", error);
    return { success: false, error: "Gagal menyimpan setoran." };
  }
}

export async function getTodayStudentProgress(studentId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await prisma.depositLog.findMany({
      where: {
        studentId,
        timestamp: {
          gte: today,
        },
      },
      select: { category: true },
    });

    const categories = logs.map(l => l.category);
    return {
      success: true,
      data: {
        hasTahfizhJadid: categories.includes("TAHFIZH_JADID"),
        hasMurajaah: categories.includes("MURAJAAH"),
        hasTilawah: categories.includes("TILAWAH"),
      }
    };
  } catch (error) {
    console.error("Failed to fetch today's progress:", error);
    return { success: false, error: "Gagal mengambil data progress hari ini." };
  }
}
