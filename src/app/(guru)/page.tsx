import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Award, LogOut, Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/login/actions";
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

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-[#800000] to-[#b30000] rounded-b-3xl px-6 pt-10 pb-12 shadow-lg relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
        
        <header className="flex justify-between items-start relative z-10">
          <div className="text-white space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">Assalamu'alaikum,</h1>
            <p className="text-white/80 font-medium">{teacherName}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 transition-all rounded-full" title="Keluar">
              <LogOut className="w-5 h-5" />
            </Button>
          </form>
        </header>
      </div>

      {/* Summary Cards */}
      <div className="px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white border-0 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 pb-2 bg-emerald-50/50">
              <div className="p-2 bg-emerald-100 w-fit rounded-lg mb-1">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-sm font-semibold text-slate-600">Total Siswa</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <span className="text-3xl font-extrabold text-slate-800">{totalSiswa}</span>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 pb-2 bg-blue-50/50">
              <div className="p-2 bg-blue-100 w-fit rounded-lg mb-1">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-sm font-semibold text-slate-600">Setoran Hari Ini</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <span className="text-3xl font-extrabold text-slate-800">{setoranHariIni}</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action */}
      <div className="px-4">
        <Link href="/input" className="block">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Activity className="w-6 h-6 text-[#800000]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Input Setoran Baru</h3>
                <p className="text-xs text-slate-500 font-medium">Catat hafalan & tilawah siswa</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="px-4 space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Setoran Terakhir
          </h2>
          <Link href="/riwayat" className="text-xs font-semibold text-[#800000] hover:underline">
            Lihat Semua
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentDeposits.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4 bg-white rounded-2xl border border-slate-50 shadow-sm">Belum ada setoran tercatat.</p>
          ) : (
            recentDeposits.map((log) => {
              const studentInitial = log.student.name.substring(0, 1).toUpperCase();
              let detailText = formatCategory(log.category);
              if (log.sourceMaterial) detailText += ` • ${log.sourceMaterial}`;
              if (log.startDetail) detailText += ` ${log.startDetail}`;
              if (log.endDetail) detailText += `-${log.endDetail}`;
              
              let gradeColor = "bg-slate-100 text-slate-700";
              if (log.grade === "Lancar") gradeColor = "bg-emerald-100 text-emerald-700";
              else if (log.grade?.includes("Biasa")) gradeColor = "bg-blue-100 text-blue-700";
              else if (log.grade?.includes("Tidak")) gradeColor = "bg-rose-100 text-rose-700";

              return (
                <div key={log.id} className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-50 hover:border-slate-100 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0">
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
  );
}
