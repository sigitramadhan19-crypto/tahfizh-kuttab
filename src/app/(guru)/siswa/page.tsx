import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SiswaForm } from "./SiswaForm";



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
      <PageHeader title="Capaian Tilawah & Hafalan" subtitle={myClass.name} />

      <div className="px-4">
        {/* Check if any student still missing statusTilawah */}
        {students.some(s => !s.statusTilawah || s.statusTilawah.trim() === "") ? (
          <div className="mb-4 bg-brand-50 border border-brand-200 rounded-xl p-4 flex gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div>
              <p className="text-brand-800 font-bold text-sm">Wajib Diisi Sebelum Melanjutkan!</p>
              <p className="text-brand-700 text-xs mt-0.5">
                Mohon lengkapi <strong>Status Tilawah</strong> dan <strong>Total Juz Hafalan</strong> untuk semua siswa. Data ini diperlukan agar sistem dapat berjalan dengan benar.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-ocean-50 border border-ocean-200 rounded-xl p-4 flex gap-3">
            <span className="text-2xl shrink-0">✅</span>
            <div>
              <p className="text-ocean-800 font-bold text-sm">Data Sudah Lengkap</p>
              <p className="text-ocean-700 text-xs mt-0.5">
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
