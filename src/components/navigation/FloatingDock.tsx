'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PieChart, WalletCards, SlidersHorizontal } from 'lucide-react';
import { CenterFab } from './CenterFab';
import { QuickAddModal } from '../transactions/QuickAddModal';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItemsLeft: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Analisis', href: '/analytics', icon: PieChart },
];

const navItemsRight: NavItem[] = [
  { label: 'Dompet', href: '/wallets', icon: WalletCards },
  { label: 'Setelan', href: '/settings', icon: SlidersHorizontal },
];

export function FloatingDock() {
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const renderTab = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`relative flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors ${
          isActive
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
        }`}
      >
        <Icon className={`h-5 w-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
        <span className="mt-1 text-[10px] tracking-tight">{item.label}</span>
        {isActive && (
          <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav
        aria-label="Bottom Floating Navigation"
        className="fixed bottom-5 left-1/2 z-40 flex h-16 w-[92%] max-w-md -translate-x-1/2 items-center justify-between rounded-full border border-slate-200/80 bg-white/85 px-4 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-black/40"
      >
        <div className="flex items-center space-x-4">
          {navItemsLeft.map(renderTab)}
        </div>

        <CenterFab
          onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
          isOpen={isQuickAddOpen}
        />

        <div className="flex items-center space-x-4">
          {navItemsRight.map(renderTab)}
        </div>
      </nav>

      {/* Quick Add Transaction Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </>
  );
}

