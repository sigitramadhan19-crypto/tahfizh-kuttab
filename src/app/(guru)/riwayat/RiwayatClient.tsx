"use client";

import { useState } from "react";
import { History, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Log = {
  id: string;
  student: { id: string; name: string };
  category: string;
  bookType: string | null;
  sourceMaterial: string | null;
  startDetail: string | null;
  endDetail: string | null;
  grade: string | null;
  timestamp: Date;
};

type Student = {
  id: string;
  name: string;
};

function formatCategory(cat: string) {
  if (cat === "TAHFIZH_JADID") return "Tahfizh Jadid";
  if (cat === "MURAJAAH") return "Muraja'ah";
  if (cat === "TILAWAH") return "Tilawah";
  return cat;
}

export function RiwayatClient({ logs, students }: { logs: Log[], students: Student[] }) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesStudent = selectedStudentId === "all" || log.student.id === selectedStudentId;
    const matchesSearch = log.sourceMaterial?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.student.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStudent && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Filter Siswa</label>
          <Select
            value={selectedStudentId}
            onValueChange={(v) => setSelectedStudentId(v || "all")}
          >
            <SelectTrigger className="bg-white h-10 w-full rounded-xl">
              <SelectValue placeholder="Semua Siswa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Siswa</SelectItem>
              {students.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Cari surat atau nama siswa..." 
            className="pl-9 bg-white h-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <History className="w-12 h-12 mb-3 text-slate-200" />
            <p className="text-sm font-medium text-slate-500">Tidak ada riwayat yang ditemukan.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
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
              <div key={log.id} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-50 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0">
                      {studentInitial}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 text-sm truncate">{log.student.name}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(log.timestamp).toLocaleDateString('id-ID', {
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {log.grade && (
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full shrink-0 ${gradeColor}`}>
                      {log.grade}
                    </span>
                  )}
                </div>
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                  <span className="font-semibold text-slate-700">{formatCategory(log.category)}</span>
                  <p className="text-slate-600 mt-0.5">
                    {log.sourceMaterial && <span className="font-medium text-[#800000]">{log.sourceMaterial}</span>}
                    {log.startDetail && <span> {log.startDetail}</span>}
                    {log.endDetail && <span> s.d {log.endDetail}</span>}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
