"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAction } from "./actions";
import { LogIn } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginAction(username, password);
      if (res.success) {
        toast.success("Berhasil masuk!");
        router.push("/");
      } else {
        toast.error(res.error || "Gagal masuk. Periksa kembali Username/Email dan Password Anda.");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-paper">

      {/* ===== LEFT PANEL — Photo (desktop) ===== */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden">
        <img src="/foto_login.png" alt="Kuttab Zad" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-2xl p-1 shadow-lg flex items-center justify-center">
              <img src="/logo_aplikasi_tahfizh.png" alt="Logo Tahfizh" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <div className="font-extrabold text-lg leading-tight">Kuttab Zad</div>
              <div className="text-white/75 text-xs">Sistem Rekap Hafalan Al-Qur&apos;an</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-1 bg-brand-400 rounded-full" />
            <h2 className="text-3xl lg:text-4xl font-extrabold leading-snug">
              Pantau Hafalan<br />Siswa dengan Mudah
            </h2>
            <p className="text-white/75 text-sm max-w-sm leading-relaxed">
              Platform digital rekap tahfizh, muraja&apos;ah, dan tilawah seluruh siswa/i Kuttab Zad dalam satu tempat.
            </p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Login Form ===== */}
      <div className="flex flex-col w-full md:w-1/2 lg:w-2/5 min-h-screen">
        {/* Mobile: photo banner */}
        <div className="md:hidden relative h-52 overflow-hidden rounded-b-[32px]">
          <img src="/foto_login.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 to-slate-900/10" />
          <div className="absolute bottom-5 left-6 right-6 flex items-center gap-3 text-white">
            <div className="w-14 h-14 bg-white rounded-2xl p-1 shadow-lg flex items-center justify-center shrink-0">
              <img src="/logo_aplikasi_tahfizh.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <div className="font-extrabold text-lg leading-tight">Kuttab Zad</div>
              <div className="text-white/80 text-xs">Sistem Rekap Hafalan Al-Qur&apos;an</div>
            </div>
          </div>
        </div>

        {/* Desktop: logos centered */}
        <div className="hidden md:flex items-center justify-center gap-6 px-8 pt-16 pb-2">
          <img src="/logo_sd.png" alt="Logo SD" className="h-24 w-24 object-contain" />
          <img src="/logo_tk.png" alt="Logo TK" className="h-24 w-24 object-contain" />
        </div>

        <div className="flex flex-col flex-1 justify-center px-6 py-8 sm:px-12">
          <div className="mb-7">
            <h2 className="text-[26px] font-extrabold text-slate-800 leading-tight">Assalamu&apos;alaikum 👋</h2>
            <p className="text-slate-500 mt-1 text-sm">Masuk dengan akun Ustadz/Ustadzah untuk melanjutkan.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-bold text-slate-700 block">
                Username / Email / NIP
              </label>
              <input
                id="username"
                type="text"
                placeholder="Masukkan username Anda"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 text-[15px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-bold text-slate-700 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Masukkan password Anda"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 text-[15px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-[15px] shadow-[0_8px_24px_-12px_rgba(158,49,49,0.6)] transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size="md" className="text-white" /> : <LogIn className="w-5 h-5" />}
              {loading ? "Memproses..." : "Masuk Sekarang"}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Sigit Ramadhan, S.Pd · Sistem Tahfizh Digital
          </p>
        </div>
      </div>

    </div>
  );
}
