"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

const PERIOD_OPTIONS = [
  { value: "all_time", label: "Semua Waktu" },
  { value: "today", label: "Hari Ini" },
  { value: "7days", label: "7 Hari Terakhir" },
  { value: "this_month", label: "Bulan Ini" },
  { value: "last_month", label: "Bulan Lalu" },
];

export function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "all_time";
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (period === "all_time") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg backdrop-blur-sm border border-white/20">
      <CalendarDays className="w-4 h-4 text-white/90 ml-2" />
      <select 
        className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer appearance-none pr-6 py-1 [&>option]:text-slate-800 disabled:opacity-50"
        value={currentPeriod}
        onChange={handlePeriodChange}
        disabled={isPending}
      >
        {PERIOD_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {isPending && (
        <span className="mr-2 animate-in fade-in zoom-in-50 duration-200">
          <Spinner size="sm" className="text-white" />
        </span>
      )}
    </div>
  );
}
