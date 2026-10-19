import { BookOpen, Users, Award, Plus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function formatCategory(cat: string) {
  if (cat === "TAHFIZH_JADID") return "Tahfizh Jadid";
  if (cat === "MURAJAAH") return "Muraja'ah";
  if (cat === "TILAWAH") return "Tilawah";
  return cat;
}

export default async function BerandaGuru() {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const teacher = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      classes: {
        include: {
          _count: {
            select: { students: { where: { isActive: true } } }
          },
          students: {
            where: { isActive: true },
            select: { id: true, statusTilawah: true }
          }
        }
      }
    }
  });

  if (!teacher) return null;

  // If GURU with students that haven't had tilawah status set → force to /siswa
  if (teacher.role === "GURU") {
    const hasStudents = teacher.classes.some(c => c.students.length > 0);
    const allFilled = teacher.classes.every(c =>
      c.students.every(s => s.statusTilawah && s.statusTilawah.trim() !== "")
    );
    if (hasStudents && !allFilled) redirect("/siswa");
  }


  if (teacher.role === "KEPALA_SEKOLAH" || teacher.role === "STAFF_TU") {
    redirect("/kepsek");
  }

  if (!teacher) redirect("/login");

  const teacherName = teacher.name;
  const totalSiswa = teacher.classes.reduce((sum, cls) => sum + cls._count.students, 0);
  const studentIds = teacher.classes.flatMap(cls => cls.students.map(s => s.id));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const setoranHariIni = await prisma.depositLog.count({
    where: {
      studentId: { in: studentIds },
      timestamp: { gte: today }
    }
  });

  const recentDeposits = await prisma.depositLog.findMany({
    where: {
      studentId: { in: studentIds }
    },
    orderBy: { timestamp: 'desc' },
    take: 5,
    include: {
      student: true
    }
  });

  const kelasLabel = teacher.classes.map((c) => c.name).join(", ");
  const jam = Number(new Intl.DateTimeFormat("id-ID", { hour: "numeric", hour12: false, timeZone: "Asia/Jakarta" }).format(new Date()));
  const waktu = jam < 11 ? "pagi" : jam < 15 ? "siang" : jam < 18 ? "sore" : "malam";
  const tanggal = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jakarta" }).format(new Date());

  return (
    <div className="space-y-5 pb-24">
      <PageHeader eyebrow={`Selamat ${waktu}, ${tanggal}`} title={teacherName} subtitle={kelasLabel || undefined} />

      {/* Summary Cards */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="size-10 grid place-items-center rounded-xl bg-ocean-50 text-ocean-600 mb-3">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-slate-800 leading-none">{totalSiswa}</p>
            <p className="mt-1.5 text-sm font-medium text-slate-500">Total siswa</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="size-10 grid place-items-center rounded-xl bg-brand-50 text-brand-600 mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-slate-800 leading-none">{setoranHariIni}</p>
            <p className="mt-1.5 text-sm font-medium text-slate-500">Setoran hari ini</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="px-4">
        <Link href="/input" className="block">
          <div className="bg-brand-600 hover:bg-brand-700 transition-colors rounded-2xl p-4 flex items-center gap-4 text-white shadow-[0_8px_24px_-12px_rgba(158,49,49,0.6)]">
            <div className="size-12 grid place-items-center rounded-xl bg-white/15 shrink-0">
              <Plus className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[17px]">Input Setoran Baru</h3>
              <p className="text-sm text-white/80 font-medium">Catat hafalan, muraja&apos;ah &amp; tilawah</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-olive-600" />
            Setoran Terakhir
          </h2>
          <Link href="/riwayat" className="text-sm font-semibold text-brand-600 hover:underline">
            Lihat semua
          </Link>
        </div>
        
        <div>
          {recentDeposits.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Belum ada setoran tercatat.</p>
          ) : (
            recentDeposits.map((log) => {
              const studentInitial = log.student.name.substring(0, 1).toUpperCase();
              let detailText = formatCategory(log.category);
              if (log.sourceMaterial) detailText += ` • ${log.sourceMaterial}`;
              if (log.startDetail) detailText += ` ${log.startDetail}`;
              if (log.endDetail) detailText += `-${log.endDetail}`;
              
              let gradeColor = "bg-slate-100 text-slate-700";
              if (log.grade === "Lancar") gradeColor = "bg-ocean-50 text-ocean-700";
              else if (log.grade?.includes("Biasa")) gradeColor = "bg-olive-100 text-olive-800";
              else if (log.grade?.includes("Tidak")) gradeColor = "bg-brand-50 text-brand-700";

              return (
                <div key={log.id} className="flex items-center justify-between gap-3 py-2.5 border-t border-slate-100 first:border-t-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-cocoa-50 flex items-center justify-center font-bold text-cocoa-600 text-sm shrink-0">
                      {studentInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 text-sm truncate">{log.student.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">{detailText}</p>
                    </div>
                  </div>
                  {log.grade && (
                    <span className={`px-3 py-1 text-xs font-bold rounded-full shrink-0 ${gradeColor}`}>
                      {log.grade}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
