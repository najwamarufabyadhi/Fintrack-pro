'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Utensils,
  ShoppingBag,
  Receipt,
  Car,
  TrendingUp,
  ArrowRightLeft,
  ChevronRight,
  Trash2,
  RotateCcw,
  Film,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Gift,
  Laptop,
} from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { Transaction, TransactionType } from '@/lib/types/database';
import { softDeleteTransaction, restoreTransaction } from '@/lib/actions/transactions';
import { useRouter } from 'next/navigation';

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

export function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
  const router = useRouter();
  const [deletedTxId, setDeletedTxId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(id);
    const res = await softDeleteTransaction(id);
    setIsDeleting(null);
    if (res.success) {
      setDeletedTxId(id);
      router.refresh();
      // Auto-hide undo after 6 seconds
      setTimeout(() => setDeletedTxId(null), 6000);
    }
  };

  const handleUndo = async () => {
    if (!deletedTxId) return;
    await restoreTransaction(deletedTxId);
    setDeletedTxId(null);
    router.refresh();
  };

  const getCategoryIcon = (iconName?: string, type?: TransactionType) => {
    if (type === 'transfer') return <ArrowRightLeft className="h-4 w-4" />;
    switch (iconName?.toLowerCase()) {
      case 'utensils':
        return <Utensils className="h-4 w-4" />;
      case 'shoppingbag':
        return <ShoppingBag className="h-4 w-4" />;
      case 'receipt':
        return <Receipt className="h-4 w-4" />;
      case 'car':
        return <Car className="h-4 w-4" />;
      case 'film':
        return <Film className="h-4 w-4" />;
      case 'heartpulse':
        return <HeartPulse className="h-4 w-4" />;
      case 'graduationcap':
        return <GraduationCap className="h-4 w-4" />;
      case 'briefcase':
        return <Briefcase className="h-4 w-4" />;
      case 'gift':
        return <Gift className="h-4 w-4" />;
      case 'laptop':
        return <Laptop className="h-4 w-4" />;
      default:
        return type === 'income' ? <TrendingUp className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getBadgeStyle = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'expense':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400';
      case 'transfer':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
    }
  };

  return (
    <section className="mt-6 px-5 mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Aktivitas Terakhir
        </h2>
        <Link
          href="/analytics"
          className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          <span>Semua</span>
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Link>
      </div>

      {/* Undo Notification Banner */}
      {deletedTxId && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-xs text-white shadow-lg animate-in slide-in-from-top duration-200 dark:bg-slate-800">
          <span>Transaksi berhasil dihapus (soft-delete).</span>
          <button
            type="button"
            onClick={handleUndo}
            className="flex items-center space-x-1 font-bold text-indigo-400 hover:text-indigo-300 ml-3"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Urungkan</span>
          </button>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 p-8 text-center">
          <p className="text-xs font-semibold text-slate-500">Belum ada transaksi tercatat</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Tekan tombol (+) di dock bawah untuk mencatat transaksi pertama Anda.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="group flex items-center justify-between p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {/* Category Icon */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getBadgeStyle(
                    tx.type
                  )}`}
                >
                  {getCategoryIcon(tx.category?.icon, tx.type)}
                </div>

                {/* Title & Metadata */}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {tx.description || tx.category?.name || (tx.type === 'transfer' ? 'Transfer Saldo' : 'Transaksi')}
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="truncate">
                      {tx.type === 'transfer'
                        ? `${tx.wallet?.name || 'Dompet'} → ${tx.destination_wallet?.name || 'Tujuan'}`
                        : tx.wallet?.name || 'Dompet'}
                    </span>
                    <span>•</span>
                    <span className="flex-shrink-0">{tx.transaction_date}</span>
                  </div>
                </div>
              </div>

              {/* Amount & Delete Action */}
              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                <div className="text-right">
                  <span
                    className={`text-xs font-bold font-mono tracking-tight tabular-nums ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'expense'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {tx.type === 'income'
                      ? `+${formatIDR(Number(tx.amount))}`
                      : tx.type === 'expense'
                      ? `-${formatIDR(Number(tx.amount))}`
                      : formatIDR(Number(tx.amount))}
                  </span>
                </div>

                {/* Soft Delete Button */}
                <button
                  type="button"
                  title="Hapus Transaksi"
                  disabled={isDeleting === tx.id}
                  onClick={(e) => handleDelete(tx.id, e)}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors opacity-60 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
