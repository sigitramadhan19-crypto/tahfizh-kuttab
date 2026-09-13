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

// How long a repeated submission with identical content counts as "the
// same one" instead of a fresh entry — covers a teacher tapping Simpan
// again (or twice, three times) because they weren't sure it went through.
const DUPLICATE_WINDOW_MS = 90_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveDepositLogOnce(data: any) {
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

  // Guard against creating a duplicate row when the exact same submission
  // (same student, same category, same content, same grade) landed only
  // moments ago — this is what makes a nervous re-tap safe: instead of a
  // 2nd/3rd row (or the teacher wrongly believing nothing saved), they get
  // told it's already there.
  const recentDuplicate = await prisma.depositLog.findFirst({
    where: {
      studentId: data.studentId,
      category: data.category as Category,
      sourceMaterial,
      startDetail,
      endDetail,
      grade: data.grade,
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recentDuplicate) {
    return { log: recentDuplicate, alreadySaved: true };
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

  // Read-after-write: don't tell the teacher it's saved until we've
  // actually confirmed, in a separate round-trip, that the row is really
  // there — this is the one thing that must never lie.
  const confirmed = await prisma.depositLog.findUnique({ where: { id: newLog.id } });
  if (!confirmed) {
    throw new Error(`DepositLog ${newLog.id} was created but could not be read back immediately after`);
  }

  return { log: confirmed, alreadySaved: false };
}

export async function saveDepositLog(data: any) {
  const MAX_ATTEMPTS = 3;
  let lastError: unknown;
  let result: { log: NonNullable<Awaited<ReturnType<typeof saveDepositLogOnce>>>["log"]; alreadySaved: boolean } | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      result = await saveDepositLogOnce(data);
      break;
    } catch (error) {
      lastError = error;
      console.error(`saveDepositLog attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error);
      if (attempt < MAX_ATTEMPTS) await sleep(300 * attempt);
    }
  }

  if (!result) {
    console.error("saveDepositLog: all attempts exhausted:", lastError);
    return {
      success: false,
      error: "Gagal menyimpan setoran setelah beberapa kali percobaan. Periksa koneksi internet, lalu coba lagi — jangan input berulang, tunggu pesan ini hilang dulu.",
    };
  }

  // The write is already confirmed at this point (saveDepositLogOnce reads
  // it back before returning). Cache revalidation is best-effort UI
  // freshness only — if it fails, the teacher must still be told the truth:
  // their data is safely saved.
  try {
    revalidatePath("/");
    revalidatePath("/riwayat");
  } catch (error) {
    console.error("saveDepositLog: revalidatePath failed (non-fatal, data is saved):", error);
  }

  return { success: true, data: result.log, alreadySaved: result.alreadySaved };
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
      orderBy: { timestamp: "asc" },
    });

    const categories = logs.map(l => l.category);
    return {
      success: true,
      data: {
        hasTahfizhJadid: categories.includes("TAHFIZH_JADID"),
        hasMurajaah: categories.includes("MURAJAAH"),
        hasTilawah: categories.includes("TILAWAH"),
        logs,
      }
    };
  } catch (error) {
    console.error("Failed to fetch today's progress:", error);
    return { success: false, error: "Gagal mengambil data progress hari ini." };
  }
}
