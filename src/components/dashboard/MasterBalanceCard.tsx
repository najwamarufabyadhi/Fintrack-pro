'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from 'lucide-react';
import { formatIDR } from '@/lib/utils';

interface MasterBalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export function MasterBalanceCard({
  totalBalance = 24580000,
  monthlyIncome = 8500000,
  monthlyExpense = 3250000,
}: MasterBalanceCardProps) {
  const [showBalance, setShowBalance] = React.useState(true);

  return (
    <div className="mx-5 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-xl shadow-indigo-950/20 border border-indigo-900/40 relative">
      {/* Decorative Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

      {/* Balance Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-indigo-200/80">
          Total Kekayaan Bersih (Net Worth)
        </span>
        <button
          type="button"
          onClick={() => setShowBalance(!showBalance)}
          className="rounded-full p-1 text-indigo-300/70 hover:text-white transition-colors"
          aria-label={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
        >
          {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>

      {/* Big Balance Number */}
      <div className="mt-2 mb-4">
        <div className="text-3xl font-extrabold font-mono tracking-tight tabular-nums">
          {showBalance ? formatIDR(totalBalance) : '••••••••••'}
        </div>
      </div>

      {/* 2-Column Summary Cards */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/40">
        
        {/* Monthly Income */}
        <div className="flex items-center space-x-2.5 rounded-xl bg-white/5 p-2.5 backdrop-blur-xs border border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-300/80 tracking-wider block">
              Pemasukan
            </span>
            <span className="text-xs font-bold font-mono tracking-tight text-white tabular-nums">
              {showBalance ? `+${formatIDR(monthlyIncome, false)}` : '••••••'}
            </span>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="flex items-center space-x-2.5 rounded-xl bg-white/5 p-2.5 backdrop-blur-xs border border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-rose-300/80 tracking-wider block">
              Pengeluaran
            </span>
            <span className="text-xs font-bold font-mono tracking-tight text-white tabular-nums">
              {showBalance ? `-${formatIDR(monthlyExpense, false)}` : '••••••'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

