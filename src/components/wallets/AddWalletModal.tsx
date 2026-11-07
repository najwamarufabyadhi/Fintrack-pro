'use client';

import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Banknote, TrendingUp, Loader2 } from 'lucide-react';
import { createWallet } from '@/lib/actions/wallets';
import { WalletType } from '@/lib/types/database';
import { useRouter } from 'next/navigation';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const walletTypeOptions: { type: WalletType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'bank', label: 'Rekening Bank', icon: CreditCard },
  { type: 'ewallet', label: 'E-Wallet', icon: Smartphone },
  { type: 'cash', label: 'Kas Tunai', icon: Banknote },
  { type: 'investment', label: 'Investasi', icon: TrendingUp },
];

const colorOptions = [
  { label: 'Indigo', value: 'from-blue-600 to-indigo-700' },
  { label: 'Cyan', value: 'from-sky-500 to-blue-600' },
  { label: 'Emerald', value: 'from-emerald-600 to-teal-700' },
  { label: 'Amber', value: 'from-amber-600 to-orange-700' },
  { label: 'Rose', value: 'from-rose-600 to-pink-700' },
  { label: 'Violet', value: 'from-purple-600 to-indigo-800' },
];

export function AddWalletModal({ isOpen, onClose }: AddWalletModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const rawBalance = parseInt(initialBalance.replace(/\D/g, '') || '0', 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama kantong wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await createWallet({
      name: name.trim(),
      type,
      initial_balance: rawBalance,
      color,
    });

    setIsSubmitting(false);

    if (!result.success) {
      if (result.error?.includes('Sesi')) {
        router.push('/login');
        onClose();
        return;
      }
      setErrorMsg(result.error || 'Gagal membuat kantong.');
      return;
    }

    // Reset and close
    setName('');
    setInitialBalance('');
    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-300 dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
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

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-1">
          Tambah Kantong Keuangan Baru
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Pisahkan rekening bank, e-wallet, atau pos tabungan Anda.
        </p>

        {errorMsg && (
          <div className="mb-3 rounded-xl bg-rose-50 p-2.5 text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Pocket Name */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Nama Kantong / Rekening
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: BCA Tabungan, Dana, Kas Harian"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* 2. Pocket Type */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Jenis Kantong
            </label>
            <div className="grid grid-cols-2 gap-2">
              {walletTypeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setType(opt.type)}
                    className={`flex items-center space-x-2 rounded-xl p-2.5 border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Initial Balance */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Saldo Awal Saat Ini (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={initialBalance ? new Intl.NumberFormat('id-ID').format(rawBalance) : ''}
              onChange={(e) => setInitialBalance(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 tabular-nums"
            />
          </div>

          {/* 4. Color Theme */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Warna Kartu
            </label>
            <div className="flex space-x-2.5">
              {colorOptions.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`h-7 w-7 rounded-full bg-gradient-to-br ${c.value} transition-transform ${
                    color === c.value ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-indigo-600 py-3 text-center text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Membuat Kantong...' : 'Simpan Kantong'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

