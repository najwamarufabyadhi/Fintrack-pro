'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ArrowRightLeft,
  TrendingDown,
  TrendingUp,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { TransactionType, Wallet, Category } from '@/lib/types/database';
import { createTransaction, getWalletsAndCategories } from '@/lib/actions/transactions';
import Link from 'next/link';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>('expense');
  const [amountInput, setAmountInput] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [selectedDestWalletId, setSelectedDestWalletId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [wallets, setWallets] = useState<Pick<Wallet, 'id' | 'name' | 'type' | 'color' | 'initial_balance'>[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch real user wallets & system categories when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingData(true);
    setActionError(null);

    getWalletsAndCategories().then((res) => {
      if (!isMounted) return;
      setIsLoadingData(false);
      setWallets(res.wallets);
      setCategories(res.categories);

      // Default wallet selections
      if (res.wallets.length > 0) {
        setSelectedWalletId(res.wallets[0].id);
        if (res.wallets.length > 1) {
          setSelectedDestWalletId(res.wallets[1].id);
        } else {
          setSelectedDestWalletId(res.wallets[0].id);
        }
      }

      // Default category selection
      const initialCats = res.categories.filter((c) => c.type === 'expense');
      if (initialCats.length > 0) {
        setSelectedCategoryId(initialCats[0].id);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Update selected category when type toggles
  useEffect(() => {
    if (type === 'transfer') {
      setSelectedCategoryId('');
      return;
    }
    const matchingCats = categories.filter((c) => c.type === type);
    if (matchingCats.length > 0 && !matchingCats.some((c) => c.id === selectedCategoryId)) {
      setSelectedCategoryId(matchingCats[0].id);
    }
  }, [type, categories, selectedCategoryId]);

  if (!isOpen) return null;

  const rawAmount = parseInt(amountInput.replace(/\D/g, '') || '0', 10);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, '');
    setAmountInput(numericOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) return;

    if (!selectedWalletId) {
      setActionError('Pilih dompet sumber terlebih dahulu.');
      return;
    }

    if (type === 'transfer' && selectedWalletId === selectedDestWalletId) {
      setActionError('Dompet asal dan dompet tujuan tidak boleh sama.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const result = await createTransaction({
      type,
      amount: rawAmount,
      wallet_id: selectedWalletId,
      destination_wallet_id: type === 'transfer' ? selectedDestWalletId : null,
      category_id: type !== 'transfer' ? selectedCategoryId : null,
      transaction_date: date,
      description: description.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      if (result.error?.includes('Sesi kedaluwarsa') || result.error?.includes('login')) {
        router.push('/login');
        onClose();
        return;
      }
      setActionError(result.error || 'Gagal menyimpan transaksi.');
      return;
    }

    // Reset and close on success
    setAmountInput('');
    setDescription('');
    onClose();
    router.refresh();
  };

  const activeCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full max-w-md rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-300 dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Top Handle / Close */}
        <div className="flex items-center justify-between pb-3">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {actionError && (
          <div className="mb-3 flex items-center space-x-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-xs">Memuat kantong & kategori...</span>
          </div>
        ) : wallets.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500" />
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Belum Ada Kantong Keuangan
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Anda perlu memiliki setidaknya 1 kantong (rekening bank, e-wallet, atau kas) untuk mencatat transaksi.
            </p>
            <Link
              href="/wallets"
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md active:scale-95 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Buat Kantong Sekarang</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Segmented Control */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center space-x-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Pengeluaran</span>
              </button>

              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center space-x-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Pemasukan</span>
              </button>

              <button
                type="button"
                onClick={() => setType('transfer')}
                className={`flex items-center justify-center space-x-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  type === 'transfer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Transfer</span>
              </button>
            </div>

            {/* 2. Jumbo Numeric Input */}
            <div className="text-center py-2">
              <p className="text-xs text-slate-400 font-medium mb-1">Nominal Transaksi</p>
              <div className="relative inline-flex items-center justify-center">
                <span
                  className={`text-3xl font-extrabold font-mono tracking-tight tabular-nums ${
                    type === 'expense'
                      ? 'text-rose-600'
                      : type === 'income'
                      ? 'text-emerald-600'
                      : 'text-blue-600'
                  }`}
                >
                  {formatIDR(rawAmount)}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  placeholder="0"
                  value={amountInput}
                  onChange={handleAmountChange}
                  className="absolute inset-0 opacity-0 cursor-text w-full text-center"
                />
              </div>
            </div>

            {/* 3. Wallet Picker */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                {type === 'transfer' ? 'Dari Dompet:' : 'Pilih Dompet:'}
              </label>
              <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    type="button"
                    onClick={() => setSelectedWalletId(wallet.id)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedWalletId === wallet.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {wallet.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3b. Destination Wallet (Transfer Only) */}
            {type === 'transfer' && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Ke Dompet Tujuan:
                </label>
                <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
                  {wallets
                    .filter((w) => w.id !== selectedWalletId)
                    .map((wallet) => (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => setSelectedDestWalletId(wallet.id)}
                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedDestWalletId === wallet.id
                            ? 'bg-blue-600 text-white shadow-xs font-semibold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {wallet.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* 4. Category Picker (Income / Expense) */}
            {type !== 'transfer' && activeCategories.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Kategori:</label>
                <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
                  {activeCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedCategoryId === cat.id
                          ? type === 'expense'
                            ? 'bg-rose-600 text-white shadow-xs font-semibold'
                            : 'bg-emerald-600 text-white shadow-xs font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Date & Description Row */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50">
                <Calendar className="h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 focus:outline-none dark:text-slate-200"
                />
              </div>

              <div className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50">
                <FileText className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Catatan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 focus:outline-none dark:text-slate-200"
                />
              </div>
            </div>

            {/* 6. Primary Submit CTA */}
            <button
              type="submit"
              disabled={rawAmount <= 0 || isSubmitting}
              className={`w-full rounded-2xl py-3.5 text-center text-sm font-semibold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                  : type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
              }`}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
