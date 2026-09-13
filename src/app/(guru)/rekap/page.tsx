import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle, Printer } from "lucide-react";
import { getJuzFromSurah } from "@/lib/quran";
import { ProgressChart } from "./ProgressChart";
import { PeriodFilter } from "@/components/ui/PeriodFilter";
import { getDateRangeFromPeriod } from "@/lib/date";

export default async function RekapCapaianPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams?.period;
  const dateRange = getDateRangeFromPeriod(period);

  const teacher = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      classes: {
        include: {
          students: {
            where: { isActive: true },
            orderBy: { name: "asc" },
            include: {
              depositLogs: {
                where: dateRange ? {
                  timestamp: {
                    gte: dateRange.gte,
                    lte: dateRange.lte,
                  }
                } : undefined,
                orderBy: { timestamp: "desc" }
              }
            }
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

  const chartData = students.map(student => ({
    nama: student.name.split(" ")[0], // Use first name for chart to save space
    totalSetoran: student.depositLogs.length,
    totalJuz: student.totalJuz || 0,
  }));

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-[#800000] to-[#b30000] sm:rounded-b-3xl px-6 pt-10 pb-10 shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
        
        <header className="flex justify-between items-start relative z-10">
          <div className="text-white space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Rekap Capaian</h1>
            <p className="text-white/80 font-medium">Kelas: {myClass.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodFilter />
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 transition-all rounded-full" title="Keluar">
                <LogOut className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </header>
      </div>

      <div className="px-4 space-y-4">
        {students.length > 0 && <ProgressChart data={chartData} />}

        {students.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500">Belum ada data siswa di kelas ini.</p>
          </div>
        ) : (
          students.map(student => {
            // Calculate Total Setoran
            const totalSetoran = student.depositLogs.length;

            // Find latest Tahfizh Jadid
            const latestTahfizh = student.depositLogs.find(log => log.category === "TAHFIZH_JADID");
            
            let posisiTahfizh = "-";
            let juzDihafal: string | number = "-";

            if (latestTahfizh) {
              const surah = latestTahfizh.sourceMaterial;
              const ayat = latestTahfizh.endDetail || latestTahfizh.startDetail;
              
              if (surah) {
                posisiTahfizh = ayat ? `${surah} ${ayat}` : surah;
                const juz = getJuzFromSurah(surah);
                if (juz) juzDihafal = juz;
              }
            }

            const juzTasmi = student.juzTasmi || "Belum Tasmi'";

            const waText = encodeURIComponent(`Assalamu'alaikum Bapak/Ibu Wali Murid dari *${student.name}*.
Berikut adalah laporan capaian ananda:
Juz Dihafal: ${juzDihafal}
Posisi Hafalan: ${posisiTahfizh}
Juz Tasmi': ${juzTasmi}
Total Setoran: ${totalSetoran} kali.
Mohon doanya agar ananda istiqomah. Barokallahu fiikum.`);

            return (
              <div key={student.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                
                {/* ===== MOBILE: original grid layout ===== */}
                <div className="md:hidden p-4 flex flex-col gap-3">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-[#800000]">{student.name}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Juz Dihafal</span>
                      <span className="font-medium text-slate-700">{juzDihafal}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Posisi Tahfizh</span>
                      <span className="font-medium text-slate-700">{posisiTahfizh}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Setoran</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                        {totalSetoran} Kali
                      </span>
                    </div>
                  </div>
                  {/* Tasmi Status on Mobile */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-medium text-emerald-600 text-xs">
                      {juzTasmi === "Belum Tasmi'" ? "Belum Tasmi'" : `Sudah Tasmi' (${juzTasmi})`}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100">
                    <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-semibold transition-colors">
                      <MessageCircle className="w-4 h-4" /> Kirim WA
                    </a>
                    <a href={`/rapor/${student.id}?period=${period || "this_month"}`} target="_blank" className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold transition-colors">
                      <Printer className="w-4 h-4" /> Cetak Rapor
                    </a>
                  </div>
                </div>

                {/* ===== DESKTOP: single-row layout ===== */}
                <div className="hidden md:flex items-center gap-4 px-4 py-3">
                  <div className="w-52 shrink-0">
                    <span className="font-semibold text-[#800000] text-sm">{student.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 w-16 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Juz</span>
                    <span className="font-semibold text-slate-700 text-sm">{juzDihafal}</span>
                  </div>
                  <div className="flex items-start gap-1.5 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 mt-0.5">Posisi</span>
                    <span className="font-medium text-slate-600 text-xs line-clamp-2 leading-relaxed">{posisiTahfizh}</span>
                  </div>
                  <div className="flex items-start gap-1.5 w-44 shrink-0">
                    <span className="font-medium text-emerald-600 text-xs line-clamp-2 leading-relaxed mt-0.5">
                      {juzTasmi === "Belum Tasmi'" ? "Belum Tasmi'" : `Sudah Tasmi' (${juzTasmi})`}
                    </span>
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                      {totalSetoran} Kali
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 border-l border-slate-200 pl-4">
                    <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-md transition-colors" title="Kirim WA">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <a href={`/rapor/${student.id}`} target="_blank" className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-md transition-colors" title="Cetak Rapor">
                      <Printer className="w-4 h-4" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
