'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface TopAppBarProps {
  userName?: string;
  isOnline?: boolean;
}

export function TopAppBar({ userName = 'Pengguna', isOnline = true }: TopAppBarProps) {
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-4">
      {/* User Greeting & Status */}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Selamat datang kembali,
        </span>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Halo, {userName} 👋
        </h1>
        <div className="flex items-center space-x-1.5 mt-0.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {isOnline ? 'Tersinkronisasi Real-time' : 'Mode Offline'}
          </span>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative rounded-full p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Avatar */}
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 p-0.5 shadow-sm">
          <div className="h-full w-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {userName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
