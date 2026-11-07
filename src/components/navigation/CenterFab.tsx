'use client';

import { Plus } from 'lucide-react';

interface CenterFabProps {
  onClick: () => void;
  isOpen?: boolean;
}

export function CenterFab({ onClick, isOpen = false }: CenterFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Catat Transaksi Cepat"
      className={`relative -top-5 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/35 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${
        isOpen ? 'rotate-45 bg-rose-600 shadow-rose-500/35' : ''
      }`}
    >
      <Plus className="h-6 w-6 stroke-[2.7] transition-transform duration-200" />
    </button>
  );
}

