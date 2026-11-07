'use client';

import React, { useState } from 'react';
import { Plus, CreditCard, Smartphone, Banknote, TrendingUp, ShieldAlert } from 'lucide-react';
import { formatIDR, getWalletGradient } from '@/lib/utils';
import { Wallet } from '@/lib/types/database';
import { AddWalletModal } from './AddWalletModal';
import Link from 'next/link';

interface WalletsViewProps {
  wallets: (Wallet & { calculatedBalance: number })[];
  isLoggedIn: boolean;
}

export function WalletsView({ wallets, isLoggedIn }: WalletsViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <CreditCard className="h-5 w-5" />;
      case 'ewallet':
        return <Smartphone className="h-5 w-5" />;
      case 'cash':
        return <Banknote className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const totalAllWallets = wallets.reduce((acc, w) => acc + w.calculatedBalance, 0);

  return (
    <main className="flex-1 w-full px-5 pt-6 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Kantong Keuangan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {wallets.length} rekening & kantong aktif
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 active:scale-95 transition-all hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah</span>
        </button>
      </div>

      {!isLoggedIn && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>Mode Tamu: Data dompet akan tersimpan permanen setelah login.</span>
          </div>
          <Link href="/login" className="font-bold underline ml-2">
            Login
          </Link>
        </div>
      )}

      {/* Total Balance Mini Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">Total Akumulasi Semua Dompet</span>
        <span className="text-base font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
          {formatIDR(totalAllWallets)}
        </span>
      </div>

      {/* Wallets List */}
      <div className="space-y-3.5">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className={`rounded-2xl p-5 text-white bg-gradient-to-br ${getWalletGradient(
              wallet.color
            )} shadow-lg shadow-slate-900/10 flex flex-col justify-between h-36 relative overflow-hidden`}
          >
            {/* Background subtle circle */}
            <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs">
                {getWalletIcon(wallet.type)}
                <span>{wallet.type}</span>
              </span>
              <span className="text-xs font-mono text-white/80">
                Awal: {formatIDR(Number(wallet.initial_balance))}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-white/90">{wallet.name}</p>
              <p className="text-2xl font-extrabold font-mono tracking-tight tabular-nums mt-0.5">
                {formatIDR(wallet.calculatedBalance)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <AddWalletModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </main>
  );
}

