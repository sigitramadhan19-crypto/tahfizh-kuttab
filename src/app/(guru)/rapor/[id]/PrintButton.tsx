"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="flex items-center justify-center gap-2 mx-auto bg-[#800000] hover:bg-[#b30000] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition-colors"
    >
      <Printer className="w-5 h-5" />
      Cetak Halaman (Print / Simpan PDF)
    </button>
  );
}
