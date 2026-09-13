import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJuzFromSurah } from "@/lib/quran";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { PrintButton } from "./PrintButton";
import { RaporPeriodFilter } from "./RaporPeriodFilter";
import { getDateRangeFromPeriod } from "@/lib/date";
import { Category } from "@prisma/client";

const CATEGORY_LABEL: Record<Category, string> = {
  TAHFIZH_JADID: "Tahfizh Jadid",
  MURAJAAH: "Muraja'ah",
  TILAWAH: "Tilawah",
};

const CATEGORY_BADGE: Record<Category, string> = {
  TAHFIZH_JADID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MURAJAAH: "bg-amber-50 text-amber-700 border-amber-200",
  TILAWAH: "bg-sky-50 text-sky-700 border-sky-200",
};

function getPeriodLabel(period: string, range: { gte?: Date; lte?: Date } | undefined) {
  if (!range?.gte || !range?.lte) return "Seluruh Riwayat";
  if (period === "this_month" || period === "last_month") {
    return format(range.gte, "d MMMM yyyy", { locale: idLocale }) === format(range.lte, "d MMMM yyyy", { locale: idLocale })
      ? format(range.gte, "d MMMM yyyy", { locale: idLocale })
      : `${format(range.gte, "d MMMM", { locale: idLocale })} – ${format(range.lte, "d MMMM yyyy", { locale: idLocale })}`;
  }
  return `${format(range.gte, "d MMM yyyy", { locale: idLocale })} – ${format(range.lte, "d MMM yyyy", { locale: idLocale })}`;
}

export default async function RaporPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams?.period || "this_month";
  const dateRange = getDateRangeFromPeriod(period);

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: {
        include: { teacher: true }
      },
      depositLogs: {
        where: dateRange ? { timestamp: { gte: dateRange.gte, lte: dateRange.lte } } : undefined,
        orderBy: { timestamp: "asc" },
      }
    }
  });

  if (!student) {
    return <div>Siswa tidak ditemukan</div>;
  }

  // Calculate stats — for "posisi hafalan" we still want the overall latest,
  // regardless of the period filter, so fetch that separately.
  const latestTahfizhOverall = await prisma.depositLog.findFirst({
    where: { studentId: student.id, category: "TAHFIZH_JADID" },
    orderBy: { timestamp: "desc" },
  });

  let posisiTahfizh = "-";
  let juzDihafal: string | number = "-";

  if (latestTahfizhOverall) {
    const surah = latestTahfizhOverall.sourceMaterial || "";
    const ayat = latestTahfizhOverall.endDetail || latestTahfizhOverall.startDetail || "";
    if (surah) {
      posisiTahfizh = ayat ? `${surah} ${ayat}` : surah;
      const juz = getJuzFromSurah(surah);
      if (juz) juzDihafal = juz;
    }
  }

  const isTK = student.class.name.toUpperCase().includes("TK");
  const schoolName = isTK ? "TK TAHFIZH ZAD" : "SD QU KUTTAB ZAD";
  const logoSrc = isTK ? "/logo_tk.png" : "/logo_sd.png";
  const accent = isTK
    ? { text: "text-[#8e1a8a]", border: "border-[#8e1a8a]", grad: "from-[#8e1a8a] to-[#b32db0]", badge: "bg-[#fbeefb] text-[#8e1a8a]" }
    : { text: "text-[#800000]", border: "border-[#800000]", grad: "from-[#800000] to-[#b30000]", badge: "bg-[#fbeaea] text-[#800000]" };

  const periodLabel = getPeriodLabel(period, dateRange);

  const summary = {
    TAHFIZH_JADID: student.depositLogs.filter(l => l.category === "TAHFIZH_JADID").length,
    MURAJAAH: student.depositLogs.filter(l => l.category === "MURAJAAH").length,
    TILAWAH: student.depositLogs.filter(l => l.category === "TILAWAH").length,
  };

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
        <RaporPeriodFilter />
      </div>

      <div className="relative max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-md print:shadow-none print:w-full overflow-hidden">

        {/* Watermark */}
        <img
          src={logoSrc}
          alt=""
          aria-hidden
          className="pointer-events-none select-none absolute -right-16 -bottom-16 w-80 h-80 opacity-[0.04] print:opacity-[0.06]"
        />

        {/* Header / Kop Surat */}
        <div className={`relative border-b-2 ${accent.border} pb-6 mb-8 flex items-center gap-5`}>
          <img src={logoSrc} alt={schoolName} className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0" />
          <div className="text-left">
            <h1 className={`text-xl sm:text-2xl font-bold ${accent.text} uppercase tracking-wider leading-tight`}>{schoolName}</h1>
            <p className="text-sm text-slate-500 mt-1">Laporan Perkembangan Tahfizh &amp; Tilawah Al-Qur&apos;an</p>
            <p className={`text-xs font-semibold mt-1.5 inline-flex items-center px-2 py-0.5 rounded ${accent.badge}`}>
              Periode: {periodLabel}
            </p>
          </div>
        </div>

        {/* Student Info */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
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
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
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
                  <td className="py-1 font-semibold text-slate-600 whitespace-nowrap">Status Tasmi&apos;</td>
                  <td className="py-1 whitespace-nowrap">: <span className="font-bold text-emerald-600">{student.juzTasmi || "Belum Tasmi'"}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="relative grid grid-cols-3 gap-3 mb-8">
          {(["TAHFIZH_JADID", "MURAJAAH", "TILAWAH"] as Category[]).map((cat) => (
            <div key={cat} className={`rounded-xl border p-3 text-center ${CATEGORY_BADGE[cat]}`}>
              <p className="text-2xl font-extrabold leading-none">{summary[cat]}</p>
              <p className="text-[11px] font-semibold mt-1.5 uppercase tracking-wide">{CATEGORY_LABEL[cat]}</p>
            </div>
          ))}
        </div>

        {/* Tabel Riwayat */}
        <div className="relative mb-8">
          <h2 className={`text-lg font-bold ${accent.text} mb-4`}>Riwayat Setoran — {periodLabel}</h2>
          {student.depositLogs.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Belum ada riwayat setoran pada periode ini.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className={`border-b-2 ${accent.border}`}>
                  <th className="py-2 px-3 text-left font-semibold text-slate-700 whitespace-nowrap">Tanggal</th>
                  <th className="py-2 px-3 text-left font-semibold text-slate-700 whitespace-nowrap">Kategori</th>
                  <th className="py-2 px-3 text-left font-semibold text-slate-700">Surah/Buku</th>
                  <th className="py-2 px-3 text-left font-semibold text-slate-700">Capaian</th>
                  <th className="py-2 px-3 text-center font-semibold text-slate-700 whitespace-nowrap">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {student.depositLogs.map((log, i) => (
                  <tr key={log.id} className={i % 2 === 1 ? "bg-slate-50" : ""}>
                    <td className="py-2 px-3 text-slate-600 whitespace-nowrap align-top">
                      {format(new Date(log.timestamp), "dd MMM yyyy", { locale: idLocale })}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap align-top">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_BADGE[log.category]}`}>
                        {CATEGORY_LABEL[log.category]}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-800 font-medium align-top">{log.sourceMaterial || "-"}</td>
                    <td className="py-2 px-3 text-slate-600 align-top">
                      {log.startDetail} {log.endDetail && log.endDetail !== log.startDetail ? `- ${log.endDetail}` : ""}
                    </td>
                    <td className={`py-2 px-3 text-center font-bold ${accent.text} whitespace-nowrap align-top`}>{log.grade || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Tanda Tangan */}
        <div className="relative mt-16 print:mt-8 pt-8 grid grid-cols-2 gap-8 text-center text-sm">
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
        <div className="relative mt-12 text-center print:hidden">
          <PrintButton />
        </div>

      </div>
    </div>
  );
}
