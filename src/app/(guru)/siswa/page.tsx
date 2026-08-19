import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SiswaForm } from "./SiswaForm";

import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function KelolaSiswaPage() {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const teacher = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      classes: {
        include: {
          students: {
            where: { isActive: true },
            orderBy: { name: "asc" }
          }
        }
      }
    }
  });

  if (!teacher || teacher.classes.length === 0) {
    return (
      <div className="p-4 pt-10 text-center">
        <p className="text-slate-500">Anda tidak memiliki kelas yang aktif.</p>
      </div>
    );
  }

  const myClass = teacher.classes[0];
  const students = myClass.students;

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-[#800000] to-[#b30000] sm:rounded-b-3xl px-6 pt-10 pb-10 shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
        
        <header className="flex justify-between items-start relative z-10">
          <div className="text-white space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Capaian Tilawah & Hafalan Siswa</h1>
            <p className="text-white/80 font-medium">Kelas: {myClass.name}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 transition-all rounded-full" title="Keluar">
              <LogOut className="w-5 h-5" />
            </Button>
          </form>
        </header>
      </div>

      <div className="px-4">
        {/* Check if any student still missing statusTilawah */}
        {students.some(s => !s.statusTilawah || s.statusTilawah.trim() === "") ? (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div>
              <p className="text-red-800 font-bold text-sm">Wajib Diisi Sebelum Melanjutkan!</p>
              <p className="text-red-700 text-xs mt-0.5">
                Mohon lengkapi <strong>Status Tilawah</strong> dan <strong>Total Juz Hafalan</strong> untuk semua siswa. Data ini diperlukan agar sistem dapat berjalan dengan benar.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
            <span className="text-2xl shrink-0">✅</span>
            <div>
              <p className="text-emerald-800 font-bold text-sm">Data Sudah Lengkap</p>
              <p className="text-emerald-700 text-xs mt-0.5">
                Semua data siswa sudah terisi. Anda bisa memperbarui kapan saja jika ada perubahan.
              </p>
            </div>
          </div>
        )}

        {students.length > 0 ? (
          <SiswaForm initialStudents={students} />
        ) : (
          <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500">Belum ada data siswa di kelas ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
