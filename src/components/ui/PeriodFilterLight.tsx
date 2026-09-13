"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

const PERIOD_OPTIONS = [
  { value: "today", label: "Hari Ini" },
  { value: "7days", label: "7 Hari Terakhir" },
  { value: "this_month", label: "Bulan Ini" },
  { value: "last_month", label: "Bulan Lalu" },
  { value: "all_time", label: "Semua Waktu" },
];

export function PeriodFilterLight({ defaultPeriod = "this_month" }: { defaultPeriod?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || defaultPeriod;
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set("period", period);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
      <CalendarDays className="w-4 h-4 text-slate-400 ml-2" />
      <select
        className="bg-transparent text-slate-700 text-sm font-medium outline-none cursor-pointer appearance-none pr-6 py-1.5 disabled:opacity-50"
        value={currentPeriod}
        onChange={handlePeriodChange}
        disabled={isPending}
      >
        {PERIOD_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {isPending && (
        <span className="mr-2 animate-in fade-in zoom-in-50 duration-200">
          <Spinner size="sm" className="text-slate-500" />
        </span>
      )}
    </div>
  );
}
