import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJuzFromSurah } from "@/lib/quran";
import { getDateRangeFromPeriod } from "@/lib/date";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Category } from "@prisma/client";
import { PrintButton } from "../../rapor/[id]/PrintButton";
import { PeriodFilterLight } from "@/components/ui/PeriodFilterLight";
import { countAyat, countBaris, countQaribSurahs } from "@/lib/tally";

function getPeriodLabel(period: string, range: { gte?: Date; lte?: Date } | undefined) {
  if (!range?.gte || !range?.lte) return "Seluruh Riwayat";
  return `${format(range.gte, "d MMMM", { locale: idLocale })} – ${format(range.lte, "d MMMM yyyy", { locale: idLocale })}`;
}

function formatMateri(log: { sourceMaterial: string | null; startDetail: string | null; endDetail: string | null } | undefined) {
  if (!log?.sourceMaterial) return "-";
  const detail = log.endDetail || log.startDetail || "";
  return detail ? `${log.sourceMaterial} ${detail}` : log.sourceMaterial;
}

export default async function RekapCetakPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams?.period || "this_month";
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
                where: dateRange ? { timestamp: { gte: dateRange.gte, lte: dateRange.lte } } : undefined,
              },
            },
          },
        },
      },
    },
  });

  if (!teacher || teacher.classes.length === 0) {
    return <div className="p-8 text-center text-slate-500">Anda tidak memiliki kelas yang aktif.</div>;
  }

  const myClass = teacher.classes[0];
  const students = myClass.students;

  // "Posisi hafalan" / "Materi terakhir" per kategori adalah posisi terkini
  // secara keseluruhan, independen dari filter periode — ambil sekaligus
  // untuk ketiga kategori dalam satu query per siswa.
  const latestLogs = await prisma.depositLog.findMany({
    where: { studentId: { in: students.map(s => s.id) } },
    orderBy: { timestamp: "desc" },
  });
  const latestByCategory: Record<Category, Map<string, (typeof latestLogs)[number]>> = {
    TAHFIZH_JADID: new Map(),
    MURAJAAH: new Map(),
    TILAWAH: new Map(),
  };
  for (const log of latestLogs) {
    const map = latestByCategory[log.category];
    if (!map.has(log.studentId)) map.set(log.studentId, log);
  }

  const isTK = myClass.name.toUpperCase().includes("TK");
  const schoolName = isTK ? "TK TAHFIZH ZAD" : "SD QU KUTTAB ZAD";
  const logoSrc = isTK ? "/logo_tk.png" : "/logo_sd.png";
  const accent = isTK
    ? { text: "text-[#8e1a8a]", border: "border-[#8e1a8a]", badge: "bg-[#fbeefb] text-[#8e1a8a]" }
    : { text: "text-[#800000]", border: "border-[#800000]", badge: "bg-[#fbeaea] text-[#800000]" };

  const periodLabel = getPeriodLabel(period, dateRange);

  const tahfizhRows = students.map((student) => {
    const latest = latestByCategory.TAHFIZH_JADID.get(student.id);
    let posisiTahfizh = "-";
    let juzDihafal: string | number = "-";
    if (latest?.sourceMaterial) {
      const juz = getJuzFromSurah(latest.sourceMaterial);
      if (juz) juzDihafal = juz;
      posisiTahfizh = formatMateri(latest);
    }
    const totalAyat = student.depositLogs
      .filter(l => l.category === "TAHFIZH_JADID")
      .reduce((s, l) => s + countAyat(l.startDetail, l.endDetail), 0);
    return {
      id: student.id,
      name: student.name,
      juzDihafal,
      posisiTahfizh,
      juzTasmi: student.juzTasmi || "Belum Tasmi'",
      totalAyat,
    };
  });

  const murajaahRows = students.map((student) => {
    const logs = student.depositLogs.filter(l => l.category === "MURAJAAH");
    const totalSurat = logs
      .filter(l => l.bookType === "MURAJAAH_QARIB")
      .reduce((s, l) => s + countQaribSurahs(l.sourceMaterial), 0);
    const sesiBaid = logs.filter(l => l.bookType === "MURAJAAH_BAID").length;
    return {
      id: student.id,
      name: student.name,
      materiTerakhir: formatMateri(latestByCategory.MURAJAAH.get(student.id)),
      totalSurat,
      sesiBaid,
    };
  });

  const tilawahRows = students.map((student) => {
    const logs = student.depositLogs.filter(l => l.category === "TILAWAH");
    const totalBarisIqra = logs
      .filter(l => l.bookType === "IQRA")
      .reduce((s, l) => s + countBaris(l.endDetail), 0);
    const totalAyatQuran = logs
      .filter(l => l.bookType === "AL-QURAN")
      .reduce((s, l) => s + countAyat(l.startDetail, l.endDetail), 0);
    return {
      id: student.id,
      name: student.name,
      materiTerakhir: formatMateri(latestByCategory.TILAWAH.get(student.id)),
      totalBarisIqra,
      totalAyatQuran,
    };
  });

  const totalTahfizh = tahfizhRows.reduce((s, r) => s + r.totalAyat, 0);
  const totalMurajaahSurat = murajaahRows.reduce((s, r) => s + r.totalSurat, 0);
  const totalMurajaahBaid = murajaahRows.reduce((s, r) => s + r.sesiBaid, 0);
  const totalTilawahBaris = tilawahRows.reduce((s, r) => s + r.totalBarisIqra, 0);
  const totalTilawahAyat = tilawahRows.reduce((s, r) => s + r.totalAyatQuran, 0);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-800">
      <style>{`
        @page { size: A4; margin: 14mm 12mm; }
        @media print {
          html, body { background: #fff; }
        }
      `}</style>

      {/* Controls (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <PeriodFilterLight />
      </div>

      <div className="relative max-w-4xl mx-auto bg-white p-8 sm:p-10 shadow-md print:shadow-none print:w-full overflow-hidden">

        {/* Watermark */}
        <img
          src={logoSrc}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute -right-16 -bottom-16 w-80 h-80 opacity-[0.04] print:opacity-[0.06]"
        />

        {/* Header / Kop Surat */}
        <div className={`relative border-b-2 ${accent.border} pb-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-5`}>
          <div className="flex items-center gap-5 flex-1 min-w-0">
            <img src={logoSrc} alt={schoolName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0" />
            <div className="text-left min-w-0">
              <h1 className={`text-lg sm:text-xl font-bold ${accent.text} uppercase tracking-wider leading-tight`}>{schoolName}</h1>
              <p className="text-sm text-slate-500 mt-1">Rekap Capaian Tahfizh &amp; Tilawah Al-Qur&apos;an — Kelas {myClass.name}</p>
              <p className={`text-xs font-semibold mt-1.5 inline-flex items-center px-2 py-0.5 rounded ${accent.badge}`}>
                Periode: {periodLabel}
              </p>
            </div>
          </div>
          <div className="shrink-0 print:hidden">
            <PrintButton />
          </div>
        </div>

        {/* Tabel Tahfizh Jadid */}
        <div className="relative mb-8 print:break-inside-avoid">
          <h2 className={`text-base font-bold ${accent.text} mb-3`}>Rekap Tahfizh Jadid</h2>
          <div className="overflow-x-auto print:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-sm border-collapse min-w-[560px] sm:min-w-0">
              <thead>
                <tr className={`border-b-2 ${accent.border}`}>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700 w-8">No</th>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700">Nama Siswa</th>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700 whitespace-nowrap">Juz Dihafal</th>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700">Posisi Hafalan</th>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700 whitespace-nowrap">Status Tasmi&apos;</th>
                  <th className="py-2 px-2 text-center font-semibold text-slate-700 whitespace-nowrap">Total Ayat</th>
                </tr>
              </thead>
              <tbody>
                {tahfizhRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 italic">Belum ada siswa di kelas ini.</td>
                  </tr>
                ) : (
                  tahfizhRows.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 1 ? "bg-slate-50" : ""}>
                      <td className="py-2 px-2 text-slate-500 align-top">{i + 1}</td>
                      <td className="py-2 px-2 font-medium text-slate-800 align-top">{r.name}</td>
                      <td className="py-2 px-2 align-top">{r.juzDihafal}</td>
                      <td className="py-2 px-2 text-slate-600 align-top">{r.posisiTahfizh}</td>
                      <td className="py-2 px-2 align-top">
                        <span className={r.juzTasmi === "Belum Tasmi'" ? "text-slate-400" : "font-semibold text-emerald-600"}>
                          {r.juzTasmi}
                        </span>
                      </td>
                      <td className={`py-2 px-2 text-center font-bold ${accent.text} align-top`}>{r.totalAyat}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {tahfizhRows.length > 0 && (
                <tfoot>
                  <tr className={`border-t-2 ${accent.border} font-bold`}>
                    <td className="py-2 px-2" colSpan={5}>Total Kelas</td>
                    <td className={`py-2 px-2 text-center ${accent.text}`}>{totalTahfizh}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Tabel Muraja'ah */}
        <div className="relative mb-8 print:break-inside-avoid">
          <h2 className={`text-base font-bold ${accent.text} mb-3`}>Rekap Muraja&apos;ah</h2>
          <div className="overflow-x-auto print:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-sm border-collapse min-w-[520px] sm:min-w-0">
              <thead>
                <tr className={`border-b-2 ${accent.border}`}>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700 w-8">No</th>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700">Nama Siswa</th>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700">Materi Terakhir</th>
                  <th className="py-2 px-2 text-center font-semibold text-slate-700 whitespace-nowrap">Total Surat</th>
                  <th className="py-2 px-2 text-center font-semibold text-slate-700 whitespace-nowrap">Sesi Ba&apos;id</th>
                </tr>
              </thead>
              <tbody>
                {murajaahRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 italic">Belum ada siswa di kelas ini.</td>
                  </tr>
                ) : (
                  murajaahRows.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 1 ? "bg-slate-50" : ""}>
                      <td className="py-2 px-2 text-slate-500 align-top">{i + 1}</td>
                      <td className="py-2 px-2 font-medium text-slate-800 align-top">{r.name}</td>
                      <td className="py-2 px-2 text-slate-600 align-top">{r.materiTerakhir}</td>
                      <td className={`py-2 px-2 text-center font-bold ${accent.text} align-top`}>{r.totalSurat}</td>
                      <td className="py-2 px-2 text-center text-slate-600 align-top">{r.sesiBaid}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {murajaahRows.length > 0 && (
                <tfoot>
                  <tr className={`border-t-2 ${accent.border} font-bold`}>
                    <td className="py-2 px-2" colSpan={3}>Total Kelas</td>
                    <td className={`py-2 px-2 text-center ${accent.text}`}>{totalMurajaahSurat}</td>
                    <td className="py-2 px-2 text-center text-slate-600">{totalMurajaahBaid}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Tabel Tilawah */}
        <div className="relative mb-8 print:break-inside-avoid">
          <h2 className={`text-base font-bold ${accent.text} mb-3`}>Rekap Tilawah</h2>
          <div className="overflow-x-auto print:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-sm border-collapse min-w-[540px] sm:min-w-0">
              <thead>
                <tr className={`border-b-2 ${accent.border}`}>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700 w-8">No</th>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700">Nama Siswa</th>
                  <th className="py-2 px-2 text-left font-semibold text-slate-700">Materi Terakhir</th>
                  <th className="py-2 px-2 text-center font-semibold text-slate-700 whitespace-nowrap">Total Baris (Iqra)</th>
                  <th className="py-2 px-2 text-center font-semibold text-slate-700 whitespace-nowrap">Total Ayat (Al-Qur&apos;an)</th>
                </tr>
              </thead>
              <tbody>
                {tilawahRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 italic">Belum ada siswa di kelas ini.</td>
                  </tr>
                ) : (
                  tilawahRows.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 1 ? "bg-slate-50" : ""}>
                      <td className="py-2 px-2 text-slate-500 align-top">{i + 1}</td>
                      <td className="py-2 px-2 font-medium text-slate-800 align-top">{r.name}</td>
                      <td className="py-2 px-2 text-slate-600 align-top">{r.materiTerakhir}</td>
                      <td className={`py-2 px-2 text-center font-bold ${accent.text} align-top`}>{r.totalBarisIqra}</td>
                      <td className={`py-2 px-2 text-center font-bold ${accent.text} align-top`}>{r.totalAyatQuran}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {tilawahRows.length > 0 && (
                <tfoot>
                  <tr className={`border-t-2 ${accent.border} font-bold`}>
                    <td className="py-2 px-2" colSpan={3}>Total Kelas</td>
                    <td className={`py-2 px-2 text-center ${accent.text}`}>{totalTilawahBaris}</td>
                    <td className={`py-2 px-2 text-center ${accent.text}`}>{totalTilawahAyat}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-10 flex items-center justify-between text-xs text-slate-400">
          <span>Dicetak pada {format(new Date(), "d MMMM yyyy, HH:mm", { locale: idLocale })}</span>
          <span>Guru Kelas: {teacher.name}</span>
        </div>

      </div>
    </div>
  );
}
