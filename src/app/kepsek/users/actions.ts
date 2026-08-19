"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function adminResetUserPasswordAction(targetUserId: string, newPassword: string) {
  try {
    const sessionId = await getSession();
    if (!sessionId) {
      return { success: false, error: "Tidak ada sesi aktif." };
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { role: true }
    });

    if (!adminUser || (adminUser.role !== "KEPALA_SEKOLAH" && adminUser.role !== "STAFF_TU")) {
      return { success: false, error: "Anda tidak memiliki akses untuk tindakan ini." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        password: hashed,
        mustChangePassword: true, // Force the user to change it on next login
      }
    });

    revalidatePath('/kepsek/users');

    return { success: true };
  } catch (error) {
    console.error("Gagal mereset password:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat mereset password." };
  }
}
