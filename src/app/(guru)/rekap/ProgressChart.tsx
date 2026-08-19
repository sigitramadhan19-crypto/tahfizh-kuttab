"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type ProgressChartProps = {
  data: {
    nama: string;
    totalSetoran: number;
    totalJuz: number;
  }[];
};

export function ProgressChart({ data }: ProgressChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">Perkembangan Kelas</h2>
        <p className="text-sm text-slate-500">Perbandingan Total Setoran dan Total Juz Hafal antar siswa</p>
      </div>
      
      <div className="h-[300px] sm:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: -20,
              bottom: 40, // space for angled labels
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="nama" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar yAxisId="left" dataKey="totalSetoran" name="Total Setoran" fill="#800000" radius={[4, 4, 0, 0]} barSize={30} />
            <Bar yAxisId="right" dataKey="totalJuz" name="Total Juz Hafal" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
