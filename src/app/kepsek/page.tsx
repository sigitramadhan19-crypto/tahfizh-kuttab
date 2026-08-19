import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { KepsekDashboardClient } from "./KepsekDashboardClient";
import { getDateRangeFromPeriod } from "@/lib/date";

export default async function KepsekPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams?.period;
  const dateRange = getDateRangeFromPeriod(period);

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, name: true, role: true, mustChangePassword: true },
  });

  if (!user || (user.role !== "KEPALA_SEKOLAH" && user.role !== "STAFF_TU")) {
    redirect("/");
  }

  // Force password change if not done yet
  if (user.mustChangePassword) redirect("/ganti-password");

  // Fetch all active students with their class and deposit logs
  const allStudents = await prisma.student.findMany({
    where: { isActive: true },
    include: {
      class: true,
      depositLogs: {
        where: dateRange ? {
          timestamp: {
            gte: dateRange.gte,
            lte: dateRange.lte,
          }
        } : undefined,
        orderBy: { timestamp: "desc" }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  // Calculate Stats
  let faseAlQuran = 0;
  let faseIqra = 0;
  let sudahTasmi = 0;
  let belumTasmi = 0;

  const studentsData: any[] = [];

  const classDataMap = new Map<string, { frekuensi: number, totalJuz: number }>();
  const classNamesSet = new Set<string>();

  allStudents.forEach(student => {
    const className = student.class.name;
    classNamesSet.add(className);

    if (!classDataMap.has(className)) {
      classDataMap.set(className, { frekuensi: 0, totalJuz: 0 });
    }

    const cData = classDataMap.get(className)!;
    cData.frekuensi += student.depositLogs.length;
    cData.totalJuz += student.totalJuz;

    // Fase
    const tilawah = (student.statusTilawah || "").toLowerCase();
    let displayTilawah = "-";
    if (tilawah.includes("quran")) {
      faseAlQuran++;
      displayTilawah = "Al-Quran";
    } else if (tilawah.includes("iqra") || tilawah.includes("jilid")) {
      faseIqra++;
      displayTilawah = "Iqra";
    }

    // Tasmi
    const tasmi = student.juzTasmi || "";
    const isBelumTasmi = tasmi === "" || tasmi.toLowerCase().includes("belum");
    if (isBelumTasmi) {
      belumTasmi++;
    } else {
      sudahTasmi++;
    }

    // Latest Tahfizh
    const latestTahfizh = student.depositLogs.find(log => log.category === "TAHFIZH_JADID");
    let capaianTahfizh = "-";
    if (latestTahfizh) {
      const surah = latestTahfizh.sourceMaterial || "";
      const ayat = latestTahfizh.endDetail || latestTahfizh.startDetail || "";
      capaianTahfizh = ayat ? `${surah} ${ayat}` : surah;
    }

    const latestLog = student.depositLogs[0];
    const latestTimestamp = latestLog ? latestLog.timestamp.getTime() : 0;

    studentsData.push({
      id: student.id,
      nama: student.name,
      kelas: className,
      tilawah: displayTilawah,
      capaianTahfizh,
      totalJuz: student.totalJuz,
      juzTasmi: tasmi || "Belum Tasmi'",
      latestTimestamp
    });
  });

  // Sort by latest setoran (descending), then by name (ascending)
  studentsData.sort((a, b) => {
    if (b.latestTimestamp !== a.latestTimestamp) {
      return b.latestTimestamp - a.latestTimestamp;
    }
    return a.nama.localeCompare(b.nama);
  });

  const totalSiswa = allStudents.length;

  const stats = {
    totalSiswa,
    faseAlQuran,
    faseIqra,
    sudahTasmi,
    belumTasmi
  };

  const chartData = Array.from(classDataMap.entries())
    .map(([kelas, data]) => ({
      kelas,
      frekuensi: data.frekuensi,
      totalJuz: data.totalJuz
    }))
    .sort((a, b) => a.kelas.localeCompare(b.kelas)); // Sort by class name

  const classes = Array.from(classNamesSet).sort();

  return (
    <KepsekDashboardClient 
      teacherName={user.name}
      userRole={user.role}
      stats={stats}
      chartData={chartData}
      students={studentsData}
      classes={classes}
    />
  );
}
