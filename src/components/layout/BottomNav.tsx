"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, History, Users, BarChart3 } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Beranda", Icon: Home },
  { href: "/input", label: "Input", Icon: PlusCircle },
  { href: "/siswa", label: "Siswa", Icon: Users },
  { href: "/rekap", label: "Rekap", Icon: BarChart3 },
  { href: "/riwayat", label: "Riwayat", Icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 w-full bg-white/95 backdrop-blur border-t border-slate-200 pb-safe z-50 print:hidden">
      <div className="grid grid-cols-5 max-w-3xl mx-auto">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 pt-2.5 pb-2 text-[11px] font-semibold transition-colors ${active ? "text-brand-700" : "text-slate-500 hover:text-brand-600"}`}>
              <span className={`grid place-items-center h-7 w-12 rounded-full transition-colors ${active ? "bg-brand-50" : ""}`}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
