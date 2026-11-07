'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRightLeft, TrendingDown, TrendingUp, Calendar, FileText, Loader2, AlertCircle } from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { TransactionType } from '@/lib/types/database';
import { createTransaction } from '@/lib/actions/transactions';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockWallets = [
  { id: 'w1', name: 'BCA Utama', color: '#005EB8' },
  { id: 'w2', name: 'GoPay', color: '#00AED6' },
  { id: 'w3', name: 'Dompet Tunai', color: '#059669' },
  { id: 'w4', name: 'Mandiri', color: '#F59E0B' },
];

const mockCategories = {
  expense: [
    { id: 'c1', name: 'Makanan', icon: 'Utensils' },
    { id: 'c2', name: 'Belanja', icon: 'ShoppingBag' },
    { id: 'c3', name: 'Tagihan', icon: 'Receipt' },
    { id: 'c4', name: 'Transport', icon: 'Car' },
    { id: 'c5', name: 'Hiburan', icon: 'Film' },
  ],
  income: [
    { id: 'c6', name: 'Gaji', icon: 'Briefcase' },
    { id: 'c7', name: 'Bonus', icon: 'Gift' },
    { id: 'c8', name: 'Investasi', icon: 'TrendingUp' },
    { id: 'c9', name: 'Freelance', icon: 'Laptop' },
  ],
};

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>('expense');
  const [amountInput, setAmountInput] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(mockWallets[0].id);
  const [selectedDestWalletId, setSelectedDestWalletId] = useState<string>(mockWallets[1].id);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(mockCategories.expense[0].id);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen) return null;

  const rawAmount = parseInt(amountInput.replace(/\D/g, '') || '0', 10);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, '');
    setAmountInput(numericOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) return;

    setIsSubmitting(true);
    setActionError(null);

    // Call Server Action
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
        // Redirect to login if unauthenticated
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

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Segmented Control */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setSelectedCategoryId(mockCategories.expense[0].id);
              }}
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
              onClick={() => {
                setType('income');
                setSelectedCategoryId(mockCategories.income[0].id);
              }}
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
              <span className={`text-3xl font-extrabold font-mono tracking-tight tabular-nums ${
                type === 'expense' ? 'text-rose-600' : type === 'income' ? 'text-emerald-600' : 'text-blue-600'
              }`}>
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
              {mockWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => setSelectedWalletId(wallet.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedWalletId === wallet.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
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
                {mockWallets
                  .filter((w) => w.id !== selectedWalletId)
                  .map((wallet) => (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => setSelectedDestWalletId(wallet.id)}
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedDestWalletId === wallet.id
                          ? 'bg-blue-600 text-white shadow-xs'
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
          {type !== 'transfer' && (
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Kategori:</label>
              <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
                {(type === 'expense' ? mockCategories.expense : mockCategories.income).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategoryId === cat.id
                        ? type === 'expense'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-emerald-600 text-white shadow-xs'
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
      </div>
    </div>
  );
}
