"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changePasswordAction } from "@/app/actions/changePassword";
import { KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface Props {
  userId: string;
  userName: string;
  username: string;
  redirectAfter: string; // "/siswa" for GURU, "/" for others
}

export function GantiPasswordClient({ userId, userName, username, redirectAfter }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    const res = await changePasswordAction(userId, newPassword);
    if (res.success) {
      toast.success("Password berhasil diperbarui!");
      router.push(redirectAfter);
      router.refresh();
    } else {
      toast.error(res.error || "Gagal memperbarui password.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#800000] to-[#b30000] px-8 pt-10 pb-12 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold">Ganti Password</h1>
            <p className="text-white/80 text-sm mt-1">
              Halo, <span className="font-semibold">{userName}</span>! Demi keamanan akun, silakan buat password baru sebelum melanjutkan.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          
          {/* Hidden username input for browser password manager */}
          <input type="text" name="username" autoComplete="username" value={username} readOnly className="hidden" />

          {/* Info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs leading-relaxed">
              Password Anda saat ini masih menggunakan password default. Wajib diganti sebelum dapat menggunakan aplikasi.
            </p>
          </div>

          {/* Password baru */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 block">Password Baru</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                name="new-password"
                autoComplete="new-password"
                placeholder="Minimal 6 karakter"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 pl-4 pr-11 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Strength indicator */}
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    newPassword.length === 0 ? 'bg-slate-200' :
                    newPassword.length < 4 && i < 2 ? 'bg-red-400' :
                    newPassword.length < 6 && i < 3 ? 'bg-amber-400' :
                    newPassword.length < 8 && i < 4 ? 'bg-yellow-400' :
                    newPassword.length >= 8 && i < 5 ? 'bg-emerald-500' :
                    'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {newPassword.length === 0 ? 'Belum diisi' :
               newPassword.length < 6 ? `Terlalu pendek (${newPassword.length}/6)` :
               newPassword.length < 8 ? 'Cukup — bisa lebih kuat' :
               'Kuat ✓'}
            </p>
          </div>

          {/* Konfirmasi */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 block">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm-password"
                autoComplete="new-password"
                placeholder="Ulangi password baru"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full h-12 pl-4 pr-11 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                  confirm.length > 0 && confirm !== newPassword
                    ? 'border-red-300 focus:ring-red-400 bg-red-50'
                    : confirm.length > 0 && confirm === newPassword
                    ? 'border-emerald-300 focus:ring-emerald-400 bg-emerald-50'
                    : 'border-slate-300 bg-white focus:ring-[#800000] focus:border-transparent'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirm.length > 0 && confirm !== newPassword && (
              <p className="text-xs text-red-500">Password tidak cocok.</p>
            )}
            {confirm.length > 0 && confirm === newPassword && (
              <p className="text-xs text-emerald-600">Password cocok ✓</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || newPassword.length < 6 || newPassword !== confirm}
            className="w-full h-12 rounded-xl bg-[#800000] hover:bg-[#600000] text-white font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <KeyRound className="w-5 h-5" />
            {loading ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>
      </div>
    </div>
  );
}
