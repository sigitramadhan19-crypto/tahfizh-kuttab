"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updateStudentsData, StudentUpdateData } from "@/app/actions/student";

type SiswaFormProps = {
  initialStudents: {
    id: string;
    name: string;
    statusTilawah: string | null;
    totalJuz: number;
    juzTasmi: string | null;
  }[];
};

export function SiswaForm({ initialStudents }: SiswaFormProps) {
  const [students, setStudents] = useState(initialStudents);
  const [isSaving, setIsSaving] = useState(false);

  const updateStudent = (id: string, field: keyof StudentUpdateData, value: any) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Sanitize data: if juzTasmi is empty, set to "Belum Tasmi'"
    const sanitizedStudents = students.map((s) => ({
      ...s,
      juzTasmi: (s.juzTasmi || "").trim() === "" ? "Belum Tasmi'" : s.juzTasmi,
    }));
    
    setStudents(sanitizedStudents);

    const dataToSave: StudentUpdateData[] = sanitizedStudents.map((s) => ({
      id: s.id,
      statusTilawah: s.statusTilawah,
      totalJuz: Number(s.totalJuz) || 0,
      juzTasmi: s.juzTasmi,
    }));

    const res = await updateStudentsData(dataToSave);
    
    if (res.success) {
      toast.success("Semua perubahan berhasil disimpan!");
    } else {
      toast.error(res.error || "Gagal menyimpan perubahan.");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-3">
      {/* ===== DESKTOP HEADER ===== */}
      <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 text-xs uppercase tracking-wider shadow-sm">
        <div className="w-52 shrink-0">Nama Siswa</div>
        <div className="w-36 shrink-0">Tilawah</div>
        <div className="w-24 shrink-0 text-center">Total Juz Hafal</div>
        <div className="flex-1 min-w-0">Juz Tasmi'</div>
      </div>

      {students.map((student) => (
        <div 
          key={student.id} 
          className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          {/* ===== MOBILE: stacked layout (default) ===== */}
          <div className="md:hidden p-4 space-y-3">
            <div className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-sm">
              {student.name}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Status Tilawah</label>
                <Select
                  value={student.statusTilawah || ""}
                  onValueChange={(val) => updateStudent(student.id, "statusTilawah", val)}
                >
                  <SelectTrigger className="bg-white h-10">
                    <SelectValue placeholder="-- Pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Iqra">Iqra</SelectItem>
                    <SelectItem value="Al-Quran">Al-Quran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Total Juz Hafal</label>
                <Input
                  type="number" min="0" max="30"
                  className="bg-white h-10"
                  value={student.totalJuz || ""}
                  onChange={(e) => updateStudent(student.id, "totalJuz", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Juz Tasmi'</label>
              <Input
                type="text"
                placeholder="Mis: 30, 29 (Kosongkan jika belum)"
                className="bg-white h-10 text-sm"
                value={student.juzTasmi || ""}
                onChange={(e) => updateStudent(student.id, "juzTasmi", e.target.value)}
              />
            </div>
          </div>

          {/* ===== DESKTOP: single-row layout ===== */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2.5">
            <div className="w-52 shrink-0 font-semibold text-slate-800 text-sm truncate">
              {student.name}
            </div>
            <div className="w-36 shrink-0">
              <Select
                value={student.statusTilawah || ""}
                onValueChange={(val) => updateStudent(student.id, "statusTilawah", val)}
              >
                <SelectTrigger className="bg-white h-9 text-xs border-slate-200">
                  <SelectValue placeholder="Status Tilawah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iqra">Iqra</SelectItem>
                  <SelectItem value="Al-Quran">Al-Quran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-24 shrink-0">
              <Input
                type="number" min="0" max="30"
                placeholder="Total Juz"
                className="bg-white h-9 text-xs text-center border-slate-200"
                value={student.totalJuz || ""}
                onChange={(e) => updateStudent(student.id, "totalJuz", e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <Input
                type="text"
                placeholder="Juz Tasmi' (mis: 30, 29)"
                className="bg-white h-9 text-xs border-slate-200"
                value={student.juzTasmi || ""}
                onChange={(e) => updateStudent(student.id, "juzTasmi", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-2">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-[#800000] hover:bg-[#600000] text-white font-bold shadow-md w-full h-12 rounded-xl text-base"
        >
          {isSaving ? "Menyimpan..." : "Simpan Semua Perubahan"}
        </Button>
      </div>
    </div>
  );
}
