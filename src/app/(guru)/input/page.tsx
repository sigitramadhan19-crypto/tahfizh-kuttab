"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Check, ChevronsUpDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { saveDepositLog, getMyClassAndStudents, getTodayStudentProgress } from "@/app/actions/deposit";
import { MultiSelect } from "@/components/ui/multi-select";
import { Spinner } from "@/components/ui/spinner";
import { SURAHS_OPTIONS } from "@/lib/surahs";

// We will fetch students dynamically now
const SURAHS = SURAHS_OPTIONS;

const BAID_OPTIONS = [
  { label: "1/4 juz pertama juz 30", value: "1/4 juz pertama juz 30" },
  { label: "1/4 juz kedua juz 30", value: "1/4 juz kedua juz 30" },
  { label: "1/4 ketiga juz 30", value: "1/4 ketiga juz 30" },
  { label: "1/4 keempat juz 30", value: "1/4 keempat juz 30" },
  { label: "1/4 juz pertama juz 29", value: "1/4 juz pertama juz 29" },
  { label: "1/4 juz kedua juz 29", value: "1/4 juz kedua juz 29" },
  { label: "1/4 ketiga juz 29", value: "1/4 ketiga juz 29" },
  { label: "1/4 keempat juz 29", value: "1/4 keempat juz 29" },
  { label: "1/4 juz pertama juz 28", value: "1/4 juz pertama juz 28" },
  { label: "1/4 juz kedua juz 28", value: "1/4 juz kedua juz 28" },
  { label: "1/4 ketiga juz 28", value: "1/4 ketiga juz 28" },
  { label: "1/4 keempat juz 28", value: "1/4 keempat juz 28" },
];

const formSchema = z.object({
  studentId: z.string().min(1, { message: "Silakan pilih siswa." }),
  category: z.enum(["TAHFIZH_JADID", "MURAJAAH", "TILAWAH"], { message: "Pilih kategori." }),
  murajaahType: z.enum(["Baid", "Qarib"]).or(z.literal("")).optional(),
  baidOption: z.string().optional(),
  qaribSurahs: z.array(z.string()).optional(),
  tilawahType: z.enum(["Al-Quran", "Iqra"]).or(z.literal("")).optional(),
  surah: z.string().optional(),
  ayatStart: z.string().optional(),
  ayatEnd: z.string().optional(),
  jilid: z.string().optional(),
  halaman: z.string().optional(),
  barisStart: z.string().optional(),
  barisEnd: z.string().optional(),
  grade: z.enum(["Lancar", "Biasa (lanjut)", "Tidak lancar (ulangi)"], { message: "Predikat nilai wajib diisi." }),
}).superRefine((data, ctx) => {
  if (data.category === "MURAJAAH") {
    if (!data.murajaahType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pilih Ba'id atau Qarib.", path: ["murajaahType"] });
    if (data.murajaahType === "Baid" && !data.baidOption) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pilih opsi Ba'id.", path: ["baidOption"] });
    if (data.murajaahType === "Qarib" && (!data.qaribSurahs || data.qaribSurahs.length === 0)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pilih setidaknya satu surat.", path: ["qaribSurahs"] });
  } else if (data.category === "TILAWAH") {
    if (!data.tilawahType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pilih Al-Quran atau Iqra.", path: ["tilawahType"] });
    if (data.tilawahType === "Iqra") {
      if (!data.jilid) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pilih Jilid.", path: ["jilid"] });
      if (!data.halaman) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Isi Halaman.", path: ["halaman"] });
    } else if (data.tilawahType === "Al-Quran") {
      if (!data.surah) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ketik Surat.", path: ["surah"] });
      if (!data.ayatStart) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mulai ayat wajib.", path: ["ayatStart"] });
    }
  } else if (data.category === "TAHFIZH_JADID") {
    if (!data.surah) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ketik Surat.", path: ["surah"] });
    if (!data.ayatStart) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mulai ayat wajib.", path: ["ayatStart"] });
  }
});

type TodayLog = {
  id: string;
  category: "TAHFIZH_JADID" | "MURAJAAH" | "TILAWAH";
  sourceMaterial: string | null;
  startDetail: string | null;
  endDetail: string | null;
  grade: string | null;
  timestamp: string | Date;
};

// Single source of truth for the form's "empty" shape. Every field must
// always resolve to a defined value (never `undefined`) — mixing undefined
// and defined values across renders is what makes Base UI's Select flip
// between uncontrolled and controlled and throw a console error. This is
// reused both for the form's initial defaultValues AND for resetting after
// a save, since form.reset(values) replaces the whole form with exactly
// `values` (any field left out becomes undefined, not its original default).
function getDefaultFormValues(studentId: string = "") {
  return {
    studentId,
    category: "" as any,
    murajaahType: "" as any,
    tilawahType: "" as any,
    grade: "" as any,
    baidOption: "",
    qaribSurahs: [] as string[],
    surah: "",
    ayatStart: "",
    ayatEnd: "",
    jilid: "",
    halaman: "",
    barisStart: "",
    barisEnd: "",
  };
}

function formatCategoryLabel(cat: string) {
  if (cat === "TAHFIZH_JADID") return "Tahfizh Jadid";
  if (cat === "MURAJAAH") return "Muraja'ah";
  if (cat === "TILAWAH") return "Tilawah";
  return cat;
}

export default function InputSetoranPage() {
  const [open, setOpen] = useState(false);
  const [openSurah, setOpenSurah] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<{id: string, name: string}[]>([]);
  const [className, setClassName] = useState<string>("");
  const [studentProgress, setStudentProgress] = useState<{ hasTahfizhJadid: boolean; hasMurajaah: boolean; hasTilawah: boolean; logs: TodayLog[] }>({ hasTahfizhJadid: false, hasMurajaah: false, hasTilawah: false, logs: [] });

  useEffect(() => {
    async function fetchMyStudents() {
      const res = await getMyClassAndStudents();
      if (res.success && res.data) {
        setStudents(res.data.students);
        setClassName(res.data.class.name);
      } else {
        toast.error("Gagal memuat data kelas Anda.");
      }
    }
    fetchMyStudents();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultFormValues()
  });

  const watchStudentId = form.watch("studentId");
  const watchCategory = form.watch("category");
  const watchMurajaahType = form.watch("murajaahType");
  const watchTilawahType = form.watch("tilawahType");

  useEffect(() => {
    async function fetchProgress() {
      if (!watchStudentId) {
        setStudentProgress({ hasTahfizhJadid: false, hasMurajaah: false, hasTilawah: false, logs: [] });
        return;
      }
      const res = await getTodayStudentProgress(watchStudentId);
      if (res.success && res.data) {
        setStudentProgress(res.data);
      }
    }
    fetchProgress();
  }, [watchStudentId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const res = await saveDepositLog(values);
      if (res.success) {
        if (res.alreadySaved) {
          toast.success("Data yang sama sudah tersimpan sebelumnya — tidak disimpan dobel.");
        } else {
          toast.success("Tersimpan & sudah terverifikasi masuk ke database ✓");
        }
        form.reset(getDefaultFormValues(values.studentId)); // keep student selected, clear the rest cleanly
        // Re-fetch progress
        const progRes = await getTodayStudentProgress(values.studentId);
        if (progRes.success && progRes.data) setStudentProgress(progRes.data);
      } else {
        toast.error(res.error || "Gagal menyimpan setoran.", { duration: 8000 });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan pada sistem.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader title="Input Setoran" subtitle={className ? `Siswa ${className} · pilih siswa, kategori, lalu predikat nilai` : "Pilih siswa, kategori, lalu predikat nilai"} />

      <div className="px-4 sm:px-6">

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Form errors:", errors);
          const errorFields = Object.keys(errors).join(', ');
          toast.error(`Gagal menyimpan: Error pada kolom [${errorFields}]. Harap periksa kembali.`);
        })} className="space-y-6">
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="font-bold text-slate-700">Pilih Siswa</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <FormControl>
                    <PopoverTrigger
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm hover:border-brand-600/50 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-600",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? students.find((s) => s.id === field.value)?.name
                        : "Cari nama siswa..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent className="w-[calc(100vw-32px)] sm:w-[450px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Ketik nama siswa..." />
                      <CommandList>
                        <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {students.map((s) => (
                            <CommandItem
                              value={s.id}
                              keywords={[s.name]}
                              key={s.id}
                              onSelect={() => {
                                form.setValue("studentId", s.id, { shouldValidate: true });
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  s.id === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {s.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PROGRESS CHECKLIST */}
          {watchStudentId && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <span className="text-slate-600 mr-2 text-xs uppercase tracking-wider font-bold">Setoran Hari Ini:</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("flex items-center px-2.5 py-1 rounded-md border transition-colors", studentProgress.hasTahfizhJadid ? "bg-ocean-50 border-ocean-200 text-ocean-700" : "bg-slate-50 border-slate-100 text-slate-400")}>
                  {studentProgress.hasTahfizhJadid ? <Check className="w-4 h-4 mr-1.5 text-ocean-600" /> : <div className="w-3.5 h-3.5 mr-1.5 rounded-full border-2 border-slate-300" />}
                  Tahfizh Jadid
                </span>
                <span className={cn("flex items-center px-2.5 py-1 rounded-md border transition-colors", studentProgress.hasMurajaah ? "bg-ocean-50 border-ocean-200 text-ocean-700" : "bg-slate-50 border-slate-100 text-slate-400")}>
                  {studentProgress.hasMurajaah ? <Check className="w-4 h-4 mr-1.5 text-ocean-600" /> : <div className="w-3.5 h-3.5 mr-1.5 rounded-full border-2 border-slate-300" />}
                  Muraja'ah
                </span>
                <span className={cn("flex items-center px-2.5 py-1 rounded-md border transition-colors", studentProgress.hasTilawah ? "bg-ocean-50 border-ocean-200 text-ocean-700" : "bg-slate-50 border-slate-100 text-slate-400")}>
                  {studentProgress.hasTilawah ? <Check className="w-4 h-4 mr-1.5 text-ocean-600" /> : <div className="w-3.5 h-3.5 mr-1.5 rounded-full border-2 border-slate-300" />}
                  Tilawah
                </span>
              </div>

              {studentProgress.logs.length > 0 && (
                <div className="w-full pt-2 mt-1 border-t border-slate-100 space-y-1.5">
                  {studentProgress.logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-ocean-600 shrink-0" />
                      <span className="font-semibold text-slate-700">{formatCategoryLabel(log.category)}</span>
                      <span className="truncate">{log.sourceMaterial}{log.startDetail ? ` ${log.startDetail}` : ""}</span>
                      {log.grade && <span className="ml-auto shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{log.grade}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Kategori</FormLabel>
                <Select onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue("murajaahType", "" as any);
                  form.setValue("tilawahType", "" as any);
                }} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 w-full rounded-xl bg-white">
                      <SelectValue placeholder="Pilih kategori setoran" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TAHFIZH_JADID">Tahfizh Jadid</SelectItem>
                    <SelectItem value="MURAJAAH">Muraja'ah</SelectItem>
                    <SelectItem value="TILAWAH">Tilawah</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* MURAJAAH OPTIONS */}
          {watchCategory === "MURAJAAH" && (
            <div className="space-y-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <FormField
                control={form.control}
                name="murajaahType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Muraja'ah</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                          <SelectValue placeholder="Pilih Ba'id atau Qarib" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Baid">Ba'id</SelectItem>
                        <SelectItem value="Qarib">Qarib</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchMurajaahType === "Baid" && (
                <FormField
                  control={form.control}
                  name="baidOption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Bagian (Ba'id)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                            <SelectValue placeholder="Pilih 1/4 Juz..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {BAID_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchMurajaahType === "Qarib" && (
                <FormField
                  control={form.control}
                  name="qaribSurahs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Beberapa Surat (Qarib)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={SURAHS}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Pilih surat..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {/* TILAWAH OPTIONS */}
          {watchCategory === "TILAWAH" && (
            <div className="space-y-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <FormField
                control={form.control}
                name="tilawahType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Tilawah</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                          <SelectValue placeholder="Al-Quran atau Iqra" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Al-Quran">Al-Quran</SelectItem>
                        <SelectItem value="Iqra">Iqra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchTilawahType === "Iqra" && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="jilid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jilid</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                              <SelectValue placeholder="Pilih Jilid" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map((j) => (
                              <SelectItem key={j} value={j.toString()}>Jilid {j}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="halaman"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Halaman</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Misal: 15" {...field} className="h-11 rounded-xl bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="barisStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mulai Baris</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Misal: 1" {...field} className="h-11 rounded-xl bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="barisEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sampai Baris</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Misal: 5" {...field} className="h-11 rounded-xl bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          )}

          {/* SURAH & AYAT (For Tahfizh Jadid & Tilawah Al-Quran) */}
          {(watchCategory === "TAHFIZH_JADID" || (watchCategory === "TILAWAH" && watchTilawahType === "Al-Quran")) && (
            <div className="space-y-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <FormField
                control={form.control}
                name="surah"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pilih Surat</FormLabel>
                    <Popover open={openSurah} onOpenChange={setOpenSurah}>
                      <FormControl>
                        <PopoverTrigger
                          role="combobox"
                          aria-expanded={openSurah}
                          className={cn(
                            "flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm hover:border-brand-600/50 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-600",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? SURAHS_OPTIONS.find((s) => s.value === field.value)?.label
                            : "Cari surat..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-[calc(100vw-32px)] sm:w-[450px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Ketik nama surat..." />
                          <CommandList>
                            <CommandEmpty>Surat tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                              {SURAHS_OPTIONS.map((s) => (
                                <CommandItem
                                  value={s.value}
                                  keywords={[s.label]}
                                  key={s.value}
                                  onSelect={() => {
                                    form.setValue("surah", s.value, { shouldValidate: true });
                                    setOpenSurah(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      s.value === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {s.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ayatStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mulai Ayat</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ayat 1" {...field} className="h-11 rounded-xl bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ayatEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sampai Ayat</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ayat 5" {...field} className="h-11 rounded-xl bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Predikat Nilai</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 w-full rounded-xl bg-white">
                      <SelectValue placeholder="Pilih Nilai" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Lancar">Lancar</SelectItem>
                    <SelectItem value="Biasa (lanjut)">Biasa (lanjut)</SelectItem>
                    <SelectItem value="Tidak lancar (ulangi)">Tidak lancar (ulangi)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-14 text-base font-bold rounded-2xl shadow-[0_8px_24px_-12px_rgba(158,49,49,0.6)] bg-brand-600 hover:bg-brand-700 text-white transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner size="md" className="text-white mr-2" /> : <BookOpen className="w-5 h-5 mr-2" />}
            {isSubmitting ? "Menyimpan..." : "Simpan Setoran"}
          </Button>
        </form>
      </Form>
      </div>
    </div>
  );
}
