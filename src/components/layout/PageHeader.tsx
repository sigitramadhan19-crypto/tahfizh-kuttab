import Image from "next/image";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

/** Bar atas (logo + keluar) dan judul halaman. Dipakai semua halaman guru & kepsek. */
export function PageHeader({
  title,
  eyebrow,
  subtitle,
  action,
  back,
}: {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  back?: React.ReactNode;
}) {
  return (
    <>
      <div className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-slate-200/70 print:hidden">
        <div className="flex items-center gap-3 px-4 h-16">
          {back}
          <Image src="/logo_aplikasi_tahfizh.png" alt="" width={36} height={36} className="size-9 rounded-xl object-contain bg-white border border-slate-200" />
          <div className="leading-tight min-w-0 flex-1">
            <div className="font-extrabold text-[15px] text-slate-800 truncate">Tahfizh Kuttab ZAD</div>
            <div className="text-[11px] font-bold tracking-wide text-brand-600">REKAP AL-QUR&apos;AN</div>
          </div>
          <form action={logoutAction}>
            <button type="submit" title="Keluar" aria-label="Keluar" className="size-10 grid place-items-center rounded-full text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      <div className="px-4 pt-5 print:hidden">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <p className="text-sm text-slate-500 font-medium">{eyebrow}</p>}
            <h1 className="text-[26px] leading-tight font-extrabold tracking-tight text-slate-800">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500 font-medium">{subtitle}</p>}
          </div>
          {action}
        </div>
      </div>
    </>
  );
}
