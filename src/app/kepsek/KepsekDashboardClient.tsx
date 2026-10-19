"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Eye, Users, BookOpen, Book, BadgeCheck, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { StudentDetailModal } from "./StudentDetailModal";
import { getStudentDepositLogs } from "./actions";
import { toast } from "sonner";
import { PeriodFilter } from "@/components/ui/PeriodFilter";
import Link from "next/link";

type Stats = {
  totalSiswa: number;
  faseAlQuran: number;
  faseIqra: number;
  sudahTasmi: number;
  belumTasmi: number;
};

type ChartData = {
  kelas: string;
  frekuensi: number;
  totalJuz: number;
};

type StudentData = {
  id: string;
  nama: string;
  kelas: string;
  tilawah: string;
  capaianTahfizh: string;
  totalJuz: number;
  juzTasmi: string;
};

interface KepsekDashboardClientProps {
  teacherName: string;
  userRole: string;
  stats: Stats;
  chartData: ChartData[];
  students: StudentData[];
  classes: string[];
}

export function KepsekDashboardClient({ 
  teacherName, 
  userRole,
  stats, 
  chartData, 
  students,
  classes
}: KepsekDashboardClientProps) {
  const [searchName, setSearchName] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua Kelas");
  const [filterFase, setFilterFase] = useState("Semua Fase");
  const [filterJuz, setFilterJuz] = useState("Semua Capaian");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [studentDetails, setStudentDetails] = useState<any>(null);

  const handleOpenDetail = async (studentId: string) => {
    setIsModalOpen(true);
    setLoadingDetails(true);
    const res = await getStudentDepositLogs(studentId);
    if (res.success) {
      setStudentDetails(res.data);
    } else {
      toast.error(res.error || "Gagal mengambil data setoran siswa");
      setIsModalOpen(false);
    }
    setLoadingDetails(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Filter by Name (Pencarian)
      if (searchName.trim() !== "") {
        if (!student.nama.toLowerCase().includes(searchName.toLowerCase())) return false;
      }

      // Filter by Kelas
      if (filterKelas !== "Semua Kelas" && student.kelas !== filterKelas) {
        return false;
      }
      
      // Filter by Fase
      if (filterFase !== "Semua Fase") {
        if (filterFase === "Al-Quran" && student.tilawah !== "Al-Quran") return false;
        if (filterFase === "Iqra" && student.tilawah !== "Iqra") return false;
      }

      // Filter by Juz
      if (filterJuz !== "Semua Capaian") {
        if (filterJuz === "0 Juz" && student.totalJuz !== 0) return false;
        if (filterJuz === "1-5 Juz" && (student.totalJuz < 1 || student.totalJuz > 5)) return false;
        if (filterJuz === "> 5 Juz" && student.totalJuz <= 5) return false;
      }

      return true;
    });
  }, [students, searchName, filterKelas, filterFase, filterJuz]);

  const dashboardTitle = userRole === "STAFF_TU" ? "Dasbor Staff TU" : "Dasbor Kepala Sekolah";

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={dashboardTitle}
          subtitle={teacherName}
          action={
            <div className="flex items-center gap-2">
              <PeriodFilter />
              <Link href="/kepsek/users" title="Manajemen Pengguna" className="h-10 px-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-700 transition-colors">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Kelola Pengguna</span>
              </Link>
            </div>
          }
        />

        <main className="p-4 sm:p-6 space-y-6">

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: "Total siswa aktif", value: stats.totalSiswa, Icon: Users, chip: "bg-slate-100 text-slate-700" },
            { label: "Fase Al-Qur'an", value: stats.faseAlQuran, Icon: BookOpen, chip: "bg-ocean-50 text-ocean-600" },
            { label: "Fase Iqra", value: stats.faseIqra, Icon: Book, chip: "bg-olive-100 text-olive-700" },
            { label: "Sudah tasmi'", value: stats.sudahTasmi, Icon: BadgeCheck, chip: "bg-cocoa-50 text-cocoa-600" },
            { label: "Belum tasmi'", value: stats.belumTasmi, Icon: Clock, chip: "bg-brand-50 text-brand-600" },
          ].map(({ label, value, Icon, chip }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className={`size-10 grid place-items-center rounded-xl mb-3 ${chip}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-slate-800 leading-none">{value}</p>
              <p className="mt-1.5 text-sm font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200 shadow-none rounded-2xl ring-0">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Frekuensi Setoran per Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e1df" />
                    <XAxis 
                      dataKey="kelas" 
                      tick={{ fontSize: 10, fill: '#6b7377' }} 
                      axisLine={false} 
                      tickLine={false} 
                      angle={-45} 
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7377' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f6f6f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="frekuensi" fill="#b73b3b" radius={[4, 4, 0, 0]} name="Frekuensi Setoran" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200 shadow-none rounded-2xl ring-0">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Total Capaian Hafalan (Juz) per Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e1df" />
                    <XAxis 
                      dataKey="kelas" 
                      tick={{ fontSize: 10, fill: '#6b7377' }} 
                      axisLine={false} 
                      tickLine={false} 
                      angle={-45} 
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7377' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f6f6f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="totalJuz" fill="#3b87b8" radius={[4, 4, 0, 0]} name="Total Juz" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-end bg-slate-50/50 flex-wrap">
            <div className="w-full sm:flex-1 space-y-1.5 min-w-[200px]">
              <label className="text-xs font-bold text-slate-500">Pencarian Siswa</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik nama siswa..."
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white transition-all"
                />
              </div>
            </div>

            <div className="w-full sm:w-1/4 space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Filter Kelas</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                value={filterKelas}
                onChange={e => setFilterKelas(e.target.value)}
              >
                <option value="Semua Kelas">Semua Kelas</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="w-full sm:w-1/4 space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Fase Tilawah</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                value={filterFase}
                onChange={e => setFilterFase(e.target.value)}
              >
                <option value="Semua Fase">Semua Fase</option>
                <option value="Al-Quran">Al-Quran</option>
                <option value="Iqra">Iqra</option>
              </select>
            </div>

            <div className="w-full sm:w-1/4 space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Pencapaian Juz</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                value={filterJuz}
                onChange={e => setFilterJuz(e.target.value)}
              >
                <option value="Semua Capaian">Semua Capaian</option>
                <option value="0 Juz">0 Juz</option>
                <option value="1-5 Juz">1-5 Juz</option>
                <option value="> 5 Juz">&gt; 5 Juz</option>
              </select>
            </div>

            <div className="w-full sm:w-1/4">
              <Button 
                className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                onClick={() => {
                  setFilterKelas("Semua Kelas");
                  setFilterFase("Semua Fase");
                  setFilterJuz("Semua Capaian");
                }}
              >
                Reset Filter
              </Button>
            </div>
          </div>

          {/* ===== DESKTOP: Table ===== */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Nama Siswa</th>
                  <th className="px-6 py-4 font-bold">Kelas</th>
                  <th className="px-6 py-4 font-bold">Tilawah</th>
                  <th className="px-6 py-4 font-bold">Capaian Tahfizh</th>
                  <th className="px-6 py-4 font-bold">Total Juz</th>
                  <th className="px-6 py-4 font-bold">Juz Tasmi'</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada data siswa yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-800">{student.nama}</td>
                      <td className="px-6 py-4 text-slate-600">{student.kelas}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${student.tilawah === 'Al-Quran' ? 'bg-ocean-100 text-ocean-700' : 'bg-olive-100 text-olive-700'}`}>
                          {student.tilawah}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{student.capaianTahfizh}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-brand-600">{student.totalJuz}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${student.juzTasmi.includes("Belum") ? 'text-slate-400 font-normal' : 'text-ocean-600'}`}>
                          {student.juzTasmi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenDetail(student.id)}
                          className="h-8 px-2 text-ocean-600 hover:bg-ocean-50 hover:text-ocean-700 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="text-xs font-semibold">Detail</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ===== MOBILE: Card list ===== */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                Tidak ada data siswa yang cocok dengan filter.
              </div>
            ) : (
              filteredStudents.map(student => (
                <div key={student.id} className="px-4 py-3 space-y-3">
                  {/* Row 1: Name + Kelas */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-800 text-sm leading-tight">{student.nama}</span>
                    <span className="text-xs text-slate-500 shrink-0 mt-0.5">{student.kelas}</span>
                  </div>
                  {/* Row 2: Info chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${student.tilawah === 'Al-Quran' ? 'bg-ocean-100 text-ocean-700' : 'bg-olive-100 text-olive-700'}`}>
                      {student.tilawah}
                    </span>
                    <span className="text-xs text-slate-500">{student.capaianTahfizh || '-'}</span>
                    <span className="text-xs font-bold text-brand-600">{student.totalJuz} Juz</span>
                    <span className={`text-xs ${student.juzTasmi.includes("Belum") ? 'text-slate-400' : 'text-ocean-600 font-semibold'}`}>
                      {student.juzTasmi}
                    </span>
                  </div>
                  {/* Row 3: Action Button */}
                  <div className="flex justify-end pt-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDetail(student.id)}
                      className="h-7 px-3 text-xs border-ocean-200 text-ocean-600 hover:bg-ocean-50 hover:text-ocean-700"
                    >
                      <Eye className="w-3 h-3 mr-1.5" />
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-right">
            Menampilkan {filteredStudents.length} siswa
          </div>
        </div>

      </main>
      </div>

      <StudentDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={studentDetails}
        loading={loadingDetails}
      />
    </div>
  );
}
