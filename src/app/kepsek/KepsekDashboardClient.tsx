"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Search, Eye, Users } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 md:rounded-b-2xl">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{dashboardTitle}</h1>
            <p className="text-red-200 text-sm mt-1 sm:mt-0">{teacherName}</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <PeriodFilter />
            <div className="flex items-center gap-2">
              <Link href="/kepsek/users">
                <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white h-10 px-3 hidden sm:flex" title="Manajemen Pengguna">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold">Kelola Pengguna</span>
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10 p-2 flex sm:hidden" title="Manajemen Pengguna">
                  <Users className="w-5 h-5" />
                </Button>
              </Link>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10 p-2" title="Keluar">
                  <LogOut className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-6">

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-1 bg-red-500 w-full" />
            <CardHeader className="pb-2 pt-4 px-3 sm:px-4">
              <CardTitle className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Total Siswa Aktif</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-4">
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">{stats.totalSiswa}</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-emerald-500 w-full" />
            <CardHeader className="pb-2 pt-4 px-3 sm:px-4">
              <CardTitle className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Fase Al-Quran</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-4">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.faseAlQuran}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-amber-500 w-full" />
            <CardHeader className="pb-2 pt-4 px-3 sm:px-4">
              <CardTitle className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Fase Iqra</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-4">
              <p className="text-2xl sm:text-3xl font-bold text-amber-600">{stats.faseIqra}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-purple-500 w-full" />
            <CardHeader className="pb-2 pt-4 px-3 sm:px-4">
              <CardTitle className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Sudah Tasmi'</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-4">
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                {stats.sudahTasmi}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-rose-500 w-full" />
            <CardHeader className="pb-2 pt-4 px-3 sm:px-4">
              <CardTitle className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Belum Tasmi'</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-4">
              <p className="text-2xl sm:text-3xl font-bold text-rose-600">{stats.belumTasmi}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-center">Frekuensi Setoran per Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="kelas" 
                      tick={{ fontSize: 10, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                      angle={-45} 
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="frekuensi" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Frekuensi Setoran" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-center">Total Capaian Hafalan (Juz) per Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="kelas" 
                      tick={{ fontSize: 10, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                      angle={-45} 
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="totalJuz" fill="#34d399" radius={[4, 4, 0, 0]} name="Total Juz" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] bg-white transition-all"
                />
              </div>
            </div>

            <div className="w-full sm:w-1/4 space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Filter Kelas</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] bg-white"
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
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] bg-white"
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
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] bg-white"
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
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${student.tilawah === 'Al-Quran' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {student.tilawah}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{student.capaianTahfizh}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#800000]">{student.totalJuz}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${student.juzTasmi.includes("Belum") ? 'text-slate-400 font-normal' : 'text-emerald-600'}`}>
                          {student.juzTasmi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenDetail(student.id)}
                          className="h-8 px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
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
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${student.tilawah === 'Al-Quran' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {student.tilawah}
                    </span>
                    <span className="text-xs text-slate-500">{student.capaianTahfizh || '-'}</span>
                    <span className="text-xs font-bold text-[#800000]">{student.totalJuz} Juz</span>
                    <span className={`text-xs ${student.juzTasmi.includes("Belum") ? 'text-slate-400' : 'text-emerald-600 font-semibold'}`}>
                      {student.juzTasmi}
                    </span>
                  </div>
                  {/* Row 3: Action Button */}
                  <div className="flex justify-end pt-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDetail(student.id)}
                      className="h-7 px-3 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
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
