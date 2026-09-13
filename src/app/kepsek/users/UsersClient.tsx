"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { adminResetUserPasswordAction } from "./actions";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

type UserData = {
  id: string;
  name: string;
  username: string;
  role: string;
  classes?: { name: string }[];
};

interface UsersClientProps {
  users: UserData[];
}

export function UsersClient({ users }: UsersClientProps) {
  const [searchName, setSearchName] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState("Kuttab123!");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchName.toLowerCase()) || 
    u.username.toLowerCase().includes(searchName.toLowerCase())
  );

  const handleOpenResetModal = (user: UserData) => {
    setSelectedUser(user);
    setNewPassword("Kuttab123!"); // Default suggested password
    setIsModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    const res = await adminResetUserPasswordAction(selectedUser.id, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(`Password untuk ${selectedUser.name} berhasil direset!`);
      setIsModalOpen(false);
    } else {
      toast.error(res.error || "Gagal mereset password");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <header className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 md:rounded-b-2xl">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/kepsek" className="hover:bg-white/20 p-2 -ml-2 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">Manajemen Pengguna</h1>
            </div>
            <p className="text-red-200 text-sm ml-9 sm:ml-12 mt-1 sm:mt-0">Kelola akun dan reset password Guru</p>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50">
              <div className="w-full sm:max-w-md space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau username..."
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ===== DESKTOP: Table ===== */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold">Nama Lengkap</th>
                    <th className="px-6 py-4 font-bold">Username / Email</th>
                    <th className="px-6 py-4 font-bold">Wali Kelas</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Tidak ada pengguna yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                        <td className="px-6 py-4 text-slate-600">{user.username}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {user.classes && user.classes.length > 0 
                            ? user.classes.map(c => c.name).join(', ') 
                            : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${user.role === 'GURU' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenResetModal(user)}
                            className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
                          >
                            <KeyRound className="w-4 h-4 mr-1.5" />
                            <span className="text-xs font-semibold">Reset Password</span>
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
              {filteredUsers.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  Tidak ada pengguna yang ditemukan.
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="px-4 py-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-800 text-sm leading-tight">{user.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${user.role === 'GURU' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 font-medium">{user.username}</div>
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold">Wali Kelas:</span> {user.classes && user.classes.length > 0 ? user.classes.map(c => c.name).join(', ') : '-'}
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenResetModal(user)}
                        className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full"
                      >
                        <KeyRound className="w-3 h-3 mr-1.5" />
                        Reset Password
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Reset Password Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Reset Password</h2>
              <p className="text-sm text-slate-500 mb-6">
                Anda akan mengubah password untuk akun <strong>{selectedUser.name}</strong> ({selectedUser.username}).
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Password Baru</label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000] text-slate-800"
                    placeholder="Masukkan password baru..."
                  />
                  <p className="text-xs text-amber-600 font-medium">
                    *User akan diminta untuk mengganti password ini saat login berikutnya.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-[#800000] hover:bg-[#660000] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Spinner size="sm" className="text-white mr-2" />}
                    {isSubmitting ? "Menyimpan..." : "Simpan Password"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
