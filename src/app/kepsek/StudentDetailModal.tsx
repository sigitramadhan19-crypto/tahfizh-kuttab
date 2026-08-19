"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { X, BookOpen, Clock, RefreshCw, User, Award } from "lucide-react";

type DepositLog = {
  id: string;
  timestamp: Date;
  category: string;
  bookType: string | null;
  sourceMaterial: string | null;
  startDetail: string | null;
  endDetail: string | null;
  grade: string | null;
};

type StudentDetailData = {
  id: string;
  name: string;
  className: string;
  totalJuz: number;
  depositLogs: DepositLog[];
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: StudentDetailData | null;
  loading: boolean;
}

export function StudentDetailModal({ isOpen, onClose, data, loading }: Props) {
  const [activeTab, setActiveTab] = useState<"TAHFIZH_JADID" | "MURAJAAH" | "TILAWAH">("TAHFIZH_JADID");

  if (!isOpen) return null;

  const logs = data?.depositLogs.filter(log => log.category === activeTab) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800000] to-[#b30000] p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              {loading ? (
                <div className="h-6 w-48 bg-white/20 rounded animate-pulse mb-2" />
              ) : (
                <h2 className="text-xl font-bold">{data?.name}</h2>
              )}
              {loading ? (
                <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
              ) : (
                <div className="flex items-center gap-3 text-red-100 text-sm mt-1">
                  <span>Kelas: {data?.className}</span>
                  <span className="w-1 h-1 bg-red-200 rounded-full" />
                  <span>Total Hafalan: {data?.totalJuz} Juz</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-2 pt-2 bg-slate-50">
          {[
            { id: "TAHFIZH_JADID", label: "Tahfizh Jadid", icon: Award },
            { id: "MURAJAAH", label: "Muraja'ah", icon: RefreshCw },
            { id: "TILAWAH", label: "Tilawah", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors border-b-2 ${
                  isActive 
                    ? "border-[#800000] text-[#800000] bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                } rounded-t-lg`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#800000]' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500">Belum ada riwayat setoran {
                activeTab === "TAHFIZH_JADID" ? "Tahfizh Jadid" :
                activeTab === "MURAJAAH" ? "Muraja'ah" : "Tilawah"
              }.</p>
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {logs.map((log) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-[#800000] text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                    <Clock className="w-4 h-4" />
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        {format(new Date(log.timestamp), "d MMM yyyy, HH:mm", { locale: id })}
                      </span>
                      {log.grade && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          Nilai: {log.grade}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{log.sourceMaterial || "-"}</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      {log.bookType && <p>Buku/Jilid: <span className="font-medium text-slate-700">{log.bookType}</span></p>}
                      {(log.startDetail || log.endDetail) && (
                        <p>
                          Capaian: <span className="font-medium text-[#800000]">{log.startDetail} {log.endDetail && `- ${log.endDetail}`}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
