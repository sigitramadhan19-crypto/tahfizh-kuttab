"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type StudentUpdateData = {
  id: string;
  statusTilawah: string | null;
  totalJuz: number;
  juzTasmi: string | null;
};

export async function updateStudentsData(studentsData: StudentUpdateData[]) {
  try {
    const sessionId = await getSession();
    if (!sessionId) {
      return { success: false, error: "Not authenticated" };
    }

    // Process all updates in a transaction
    await prisma.$transaction(
      studentsData.map((data) =>
        prisma.student.update({
          where: { id: data.id },
          data: {
            statusTilawah: data.statusTilawah,
            totalJuz: data.totalJuz,
            juzTasmi: data.juzTasmi,
          },
        })
      )
    );

    revalidatePath("/siswa");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating students:", error);
    return { success: false, error: "Gagal menyimpan perubahan. Silakan coba lagi." };
  }
}
