'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Lock, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: email.split('@')[0] },
          },
        });
        if (error) throw error;

        if (data.session) {
          // Auto-login if email confirmation is disabled
          router.push('/');
          router.refresh();
        } else {
          setSuccessMessage('Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi, atau login jika verifikasi email dinonaktifkan.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email atau kata sandi salah. Jika belum pernah mendaftar, klik "Belum punya akun? Buat akun baru" di bawah.');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Email belum dikonfirmasi. Silakan periksa inbox email Anda atau nonaktifkan "Confirm email" di Supabase Auth.');
          }
          throw error;
        }
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Terjadi kesalahan saat otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full px-5 pt-8 pb-12 flex flex-col justify-center">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            FinTrack Pro
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {isSignUp ? 'Daftar akun baru untuk mulai melacak keuangan' : 'Masuk ke akun Anda untuk sinkronisasi mutasi'}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-800/80">
        <form onSubmit={handleAuth} className="space-y-4">
          {errorMessage && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              {successMessage}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Email
            </label>
            <div className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/60">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Kata Sandi
            </label>
            <div className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/60">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-center text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Memproses...' : isSignUp ? 'Daftar Akun' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            {isSignUp ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Buat akun baru'}
          </button>
        </div>
      </div>
    </main>
  );
}

