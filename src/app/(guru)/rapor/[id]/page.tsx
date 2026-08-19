import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJuzFromSurah } from "@/lib/quran";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { PrintButton } from "./PrintButton";

export default async function RaporPage({ params }: { params: Promise<{ id: string }> }) {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: {
        include: { teacher: true }
      },
      depositLogs: {
        orderBy: { timestamp: "desc" },
        take: 15 // Only show last 15 deposits for the report
      }
    }
  });

  if (!student) {
    return <div>Siswa tidak ditemukan</div>;
  }

  // Calculate stats
  const latestTahfizh = student.depositLogs.find(log => log.category === "TAHFIZH_JADID");
  let posisiTahfizh = "-";
  let juzDihafal: string | number = "-";

  if (latestTahfizh) {
    const surah = latestTahfizh.sourceMaterial || "";
    const ayat = latestTahfizh.endDetail || latestTahfizh.startDetail || "";
    if (surah) {
      posisiTahfizh = ayat ? `${surah} ${ayat}` : surah;
      const juz = getJuzFromSurah(surah);
      if (juz) juzDihafal = juz;
    }
  }

  const isTK = student.class.name.toUpperCase().includes("TK");
  const schoolName = isTK ? "TK TAHFIZH ZAD" : "SD QU KUTTAB ZAD";

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-800">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-md print:shadow-none print:w-full">
        
        {/* Header / Kop Surat */}
        <div className="border-b-2 border-[#800000] pb-6 mb-8 text-center flex flex-col items-center">
          <h1 className="text-2xl font-bold text-[#800000] uppercase tracking-wider">{schoolName}</h1>
          <p className="text-sm text-slate-500 mt-1">Laporan Perkembangan Tahfizh & Tilawah Al-Quran</p>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-8 text-sm">
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1 w-24 sm:w-28 font-semibold text-slate-600 whitespace-nowrap">Nama Siswa</td>
                  <td className="py-1 font-medium whitespace-nowrap">: {student.name}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-slate-600 whitespace-nowrap">Kelas</td>
                  <td className="py-1 font-medium whitespace-nowrap">: {student.class.name}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-slate-600 whitespace-nowrap">Guru Kelas</td>
                  <td className="py-1 font-medium whitespace-nowrap">: {student.class.teacher?.name || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1 w-24 sm:w-28 font-semibold text-slate-600 whitespace-nowrap">Juz Dihafal</td>
                  <td className="py-1 whitespace-nowrap">: <span className="font-bold">{juzDihafal}</span></td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-slate-600 whitespace-nowrap">Posisi Hafalan</td>
                  <td className="py-1 font-medium whitespace-nowrap">: {posisiTahfizh}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-slate-600 whitespace-nowrap">Status Tasmi'</td>
                  <td className="py-1 whitespace-nowrap">: <span className="font-bold text-emerald-600">{student.juzTasmi || "Belum Tasmi'"}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Riwayat */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#800000] mb-4">Riwayat Setoran Terakhir</h2>
          {student.depositLogs.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Belum ada riwayat setoran.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200">
                  <th className="py-2 px-3 text-left font-semibold text-slate-700 whitespace-nowrap">Tanggal</th>
                  <th className="py-2 px-3 text-left font-semibold text-slate-700 whitespace-nowrap">Kategori</th>
                  <th className="py-2 px-3 text-left font-semibold text-slate-700">Surah/Buku</th>
                  <th className="py-2 px-3 text-left font-semibold text-slate-700">Capaian</th>
                  <th className="py-2 px-3 text-center font-semibold text-slate-700 whitespace-nowrap">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {student.depositLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100">
                    <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                      {format(new Date(log.timestamp), "dd MMM yyyy", { locale: idLocale })}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {log.category === "TAHFIZH_JADID" ? "Tahfizh Jadid" : log.category === "MURAJAAH" ? "Muraja'ah" : "Tilawah"}
                    </td>
                    <td className="py-2 px-3 text-slate-800 font-medium">{log.sourceMaterial || "-"}</td>
                    <td className="py-2 px-3 text-slate-600">
                      {log.startDetail} {log.endDetail && log.endDetail !== log.startDetail ? `- ${log.endDetail}` : ""}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-[#800000] whitespace-nowrap">{log.grade || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Tanda Tangan */}
        <div className="mt-16 print:mt-8 pt-8 grid grid-cols-2 gap-8 text-center text-sm">
          <div>
            <p className="mb-16 print:mb-12 text-slate-600">Wali Murid,</p>
            <div className="w-40 border-b border-slate-400 mx-auto"></div>
          </div>
          <div>
            <p className="mb-16 print:mb-12 text-slate-600">Guru Pengampu,</p>
            <div className="w-40 border-b border-slate-400 mx-auto"></div>
            <p className="mt-2 font-semibold text-slate-800">{student.class.teacher?.name}</p>
          </div>
        </div>

        {/* Print Button (Hidden in Print Mode) */}
        <div className="mt-12 text-center print:hidden">
          <PrintButton />
        </div>

      </div>
    </div>
  );
}
