import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
      <Spinner size="lg" className="text-[#800000]" />
      <p className="text-sm font-medium text-slate-400">Memuat...</p>
    </div>
  );
}
