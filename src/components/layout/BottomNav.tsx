"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, History, Users, BarChart3 } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe z-50 print:hidden">
      <div className="flex justify-around items-center h-16 max-w-3xl mx-auto">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/' ? 'text-[#800000]' : 'text-slate-500 hover:text-[#b30000]'}`}>
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Beranda</span>
        </Link>
        <Link href="/input" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/input' ? 'text-[#800000]' : 'text-slate-500 hover:text-[#b30000]'}`}>
          <PlusCircle className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Input</span>
        </Link>
        <Link href="/siswa" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/siswa' ? 'text-[#800000]' : 'text-slate-500 hover:text-[#b30000]'}`}>
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Siswa</span>
        </Link>
        <Link href="/rekap" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/rekap' ? 'text-[#800000]' : 'text-slate-500 hover:text-[#b30000]'}`}>
          <BarChart3 className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Rekap</span>
        </Link>
        <Link href="/riwayat" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/riwayat' ? 'text-[#800000]' : 'text-slate-500 hover:text-[#b30000]'}`}>
          <History className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Riwayat</span>
        </Link>
      </div>
    </div>
  );
}
