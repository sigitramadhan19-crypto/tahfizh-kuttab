"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAction } from "./actions";
import { LogIn, BookOpen } from "lucide-react";

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
    <div className="flex min-h-screen w-full">

      {/* ===== LEFT PANEL — Photo (hidden on mobile) ===== */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden">
        {/* Background photo */}
        <img
          src="/foto_login.png"
          alt="Kuttab Zad"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#800000]/80 via-[#800000]/50 to-black/60" />

        {/* Content on top of photo */}
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-2xl p-1 shadow-lg flex items-center justify-center">
              <img
                src="/logo_aplikasi_tahfizh.png"
                alt="Logo Tahfizh"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-lg leading-tight">Kuttab Zad</div>
              <div className="text-white/70 text-xs">Sistem Rekap Hafalan Al-Qur'an</div>
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="space-y-3">
            <div className="w-12 h-1 bg-white/60 rounded-full" />
            <h2 className="text-3xl lg:text-4xl font-extrabold leading-snug">
              Pantau Hafalan<br />Siswa dengan Mudah
            </h2>
            <p className="text-white/70 text-sm max-w-sm leading-relaxed">
              Platform digital rekap tahfizh, muraja'ah, dan tilawah seluruh siswa/i Kuttab Zad dalam satu tempat.
            </p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Login Form ===== */}
      <div className="flex flex-col w-full md:w-1/2 lg:w-2/5 min-h-screen bg-white">
        {/* Mobile: show background photo behind form */}
        <div className="md:hidden absolute inset-0 z-0">
          <img src="/foto_login.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Desktop: logos centered */}
        <div className="hidden md:flex items-center justify-center gap-6 px-8 pt-16 pb-2">
          <img
            src="/logo_sd.png"
            alt="Logo SD"
            className="h-28 w-28 object-contain drop-shadow-md"
          />
          <img
            src="/logo_tk.png"
            alt="Logo TK"
            className="h-28 w-28 object-contain drop-shadow-md"
          />
        </div>

        {/* Form container */}
        <div className="relative z-10 flex flex-col flex-1 justify-center px-8 py-6 sm:px-12">

          {/* Mobile logo */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl p-1.5 shadow-xl flex items-center justify-center mb-3">
              <img src="/logo_aplikasi_tahfizh.png" alt="Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-white font-extrabold text-xl text-center">Kuttab Zad</h1>
            <p className="text-white/70 text-xs text-center">Sistem Rekap Hafalan Al-Qur'an</p>
          </div>

          {/* Greeting */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800 md:block hidden">Selamat Datang! 👋</h2>
            <p className="text-slate-500 mt-1 text-sm md:block hidden">Masukkan Akun Ustadz/Ustadzah untuk melanjutkan.</p>
            <h2 className="text-2xl font-extrabold text-white md:hidden text-center">Masuk ke Akun Anda</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-bold text-slate-700 md:text-slate-700 text-white block">
                Username / Email / NIP
              </label>
              <input
                id="username"
                type="text"
                placeholder="Masukkan username Anda"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-bold text-slate-700 md:text-slate-700 text-white block">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Masukkan password Anda"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#800000] hover:bg-[#600000] active:scale-[0.98] text-white font-bold text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {loading ? "Memproses..." : "Masuk Sekarang"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-slate-400 md:text-slate-400 text-white/50">
            © {new Date().getFullYear()} Sigit Ramadhan, S.Pd · Sistem Tahfizh Digital
          </p>
        </div>
      </div>

    </div>
  );
}

