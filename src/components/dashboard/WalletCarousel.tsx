'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, Smartphone, Banknote, Plus, ChevronRight, TrendingUp } from 'lucide-react';
import { formatIDR, getWalletGradient } from '@/lib/utils';
import { Wallet } from '@/lib/types/database';

interface WalletCarouselProps {
  wallets?: (Wallet & { calculatedBalance: number })[];
}

export function WalletCarousel({ wallets = [] }: WalletCarouselProps) {
  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <CreditCard className="h-4 w-4" />;
      case 'ewallet':
        return <Smartphone className="h-4 w-4" />;
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Kantong & Rekening
        </h2>
        <Link
          href="/wallets"
          className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          <span>Kelola</span>
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Link>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar px-5 pb-1">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className={`flex-shrink-0 w-44 rounded-2xl p-4 text-white bg-gradient-to-br ${getWalletGradient(
              wallet.color
            )} shadow-md shadow-slate-900/10 transition-transform active:scale-98`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
                {getWalletIcon(wallet.type)}
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-black/20">
                {wallet.type}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-white/80 truncate">{wallet.name}</p>
              <p className="text-sm font-bold font-mono tracking-tight tabular-nums mt-0.5">
                {formatIDR(wallet.calculatedBalance)}
              </p>
            </div>
          </div>
        ))}

        {/* Add Pocket Button */}
        <Link
          href="/wallets"
          className="flex-shrink-0 w-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-4 text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold text-center">Tambah Kantong</span>
        </Link>
      </div>
    </section>
  );
}
