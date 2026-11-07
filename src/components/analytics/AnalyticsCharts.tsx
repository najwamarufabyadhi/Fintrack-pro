'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatIDR } from '@/lib/utils';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface MonthlyPoint {
  month: string;
  pemasukan: number;
  pengeluaran: number;
}

interface CategoryPoint {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface AnalyticsChartsProps {
  monthlyData: MonthlyPoint[];
  categoryData: CategoryPoint[];
  totalIncome: number;
  totalExpense: number;
}

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function AnalyticsCharts({
  monthlyData,
  categoryData,
  totalIncome,
  totalExpense,
}: AnalyticsChartsProps) {
  const netCashFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Cashflow Summary Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Arus Kas Bersih (Bulan Berjalan)
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              savingsRate >= 0
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
            }`}
          >
            {savingsRate >= 0 ? `Surplus +${savingsRate}%` : `Defisit ${savingsRate}%`}
          </span>
        </div>
        <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
          {formatIDR(netCashFlow)}
        </p>

        <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-2.5">
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Total Masuk</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {formatIDR(totalIncome)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-2.5">
            <div className="p-1 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/40">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Total Keluar</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                {formatIDR(totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monthly Cashflow Bar Chart (6 Months Trend) */}
      <section className="rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tren Arus Kas (6 Bulan)
          </h2>
          <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
            <div className="flex items-center space-x-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Masuk</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span>Keluar</span>
            </div>
          </div>
        </div>

        <div className="h-56 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={10}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Jt`}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: unknown) => [formatIDR(Number(value) || 0), '']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. Category Breakdown (Donut & List) */}
      <section className="rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Alokasi Pengeluaran
          </h2>
          <span className="text-xs font-medium text-slate-400">
            {categoryData.length} Kategori
          </span>
        </div>

        {categoryData.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Belum ada data pengeluaran bulan ini.</p>
          </div>
        ) : (
          <>
            {/* Donut Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown) => [formatIDR(Number(val) || 0), '']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Rows */}
            <div className="space-y-2.5 mt-3">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color || COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono tabular-nums">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatIDR(cat.value)}
                    </span>
                    <span className="text-slate-400 w-8 text-right">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

