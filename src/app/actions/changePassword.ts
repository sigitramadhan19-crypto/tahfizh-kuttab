"use server";

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function changePasswordAction(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: 'Sesi tidak valid.' };
  if (newPassword.length < 6) return { success: false, error: 'Password baru minimal 6 karakter.' };

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
        mustChangePassword: false,
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: 'Gagal menyimpan password baru.' };
  }
}
