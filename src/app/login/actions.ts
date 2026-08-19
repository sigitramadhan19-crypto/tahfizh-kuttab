"use server";

import { setSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export async function loginAction(username: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (user) {
      // Cek apakah password di database sudah di-hash (bcrypt selalu diawali $2)
      const isHashed = user.password.startsWith("$2");
      let isMatch = false;

      if (isHashed) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        // Fallback untuk akun yang belum diganti (masih plain text)
        isMatch = user.password === password;
      }

      if (isMatch) {
        await setSession(user.id);
        return { success: true };
      }
    }

    return { success: false, error: "Username atau password salah." };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
