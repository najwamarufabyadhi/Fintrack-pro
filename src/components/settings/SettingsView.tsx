'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Download, FileSpreadsheet, Globe, LogOut, ChevronRight, CheckCircle2, Loader2, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';
import Link from 'next/link';

interface SettingsViewProps {
  user: {
    id: string;
    email?: string;
    fullName: string;
  } | null;
}

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handleExport = async (format: 'xlsx' | 'csv') => {
    if (format === 'xlsx') setIsExportingExcel(true);
    else setIsExportingCSV(true);
    setExportSuccess(null);

    try {
      // 1. Fetch user transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          transaction_date,
          type,
          amount,
          description,
          wallet:wallet_id(name),
          category:category_id(name)
        `)
        .is('deleted_at', null)
        .order('transaction_date', { ascending: false });

      const rows =
        transactions && transactions.length > 0
          ? transactions.map((t, idx) => ({
              No: idx + 1,
              Tanggal: t.transaction_date,
              Tipe: t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer',
              Kategori: (t.category as unknown as { name?: string })?.name || '-',
              Dompet: (t.wallet as unknown as { name?: string })?.name || '-',
              Nominal: Number(t.amount),
              Keterangan: t.description || '-',
            }))
          : [
              {
                No: 1,
                Tanggal: new Date().toISOString().split('T')[0],
                Tipe: 'Pengeluaran',
                Kategori: 'Makanan & Minuman',
                Dompet: 'BCA Prioritas',
                Nominal: 45000,
                Keterangan: 'Contoh Data Ekspor FinTrack',
              },
            ];

      // 2. Generate file with XLSX
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Mutasi Keuangan');

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `FinTrack_Laporan_${dateStr}.${format}`;

      XLSX.writeFile(workbook, fileName, { bookType: format });
      setExportSuccess(`Laporan berhasil diunduh sebagai ${fileName}`);
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExportingExcel(false);
      setIsExportingCSV(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <main className="flex-1 w-full px-5 pt-6 pb-20">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Setelan Akun
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Preferensi tampilan, mata uang, dan ekspor data
        </p>
      </div>

      {exportSuccess && (
        <div className="mb-4 flex items-center space-x-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* User Profile Mini Card */}
      {user ? (
        <div className="flex items-center space-x-3.5 rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 p-0.5">
            <div className="h-full w-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Mode Tamu</p>
            <p className="text-xs text-slate-400">Masuk untuk mengaktifkan sinkronisasi cloud</p>
          </div>
          <Link
            href="/login"
            className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk Akun</span>
          </Link>
        </div>
      )}

      {/* Preferences Section */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1 mb-2">
            Preferensi Sistem
          </span>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Mata Uang Dasar</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">IDR (Rp)</span>
            </div>

            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Keamanan Supabase RLS</span>
              </div>
              <span className="font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Terproteksi
              </span>
            </div>
          </div>
        </div>

        {/* Export Data Section */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1 mb-2">
            Ekspor & Kepatuhan Finansial
          </span>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
            
            {/* Excel Export */}
            <button
              type="button"
              disabled={isExportingExcel}
              onClick={() => handleExport('xlsx')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 block">
                    Ekspor Laporan Excel (.xlsx)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Format pembukuan spreadsheet siap audit
                  </span>
                </div>
              </div>
              {isExportingExcel ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <Download className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {/* CSV Export */}
            <button
              type="button"
              disabled={isExportingCSV}
              onClick={() => handleExport('csv')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <Download className="h-4 w-4 text-indigo-500" />
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 block">
                    Ekspor Format CSV
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Format universal untuk import aplikasi lain
                  </span>
                </div>
              </div>
              {isExportingCSV ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Logout */}
        {user && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 rounded-2xl border border-rose-200 bg-rose-50/50 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-100/60 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

