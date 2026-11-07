import Link from 'next/link';
import { TopAppBar } from '@/components/dashboard/TopAppBar';
import { MasterBalanceCard } from '@/components/dashboard/MasterBalanceCard';
import { WalletCarousel } from '@/components/dashboard/WalletCarousel';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { getDashboardData } from '@/lib/data/finance';
import { LogIn } from 'lucide-react';

export default async function HomePage() {
  const data = await getDashboardData();
  const isLoggedIn = !!data.user;

  const totalBalance = data.totalBalance;
  const monthlyIncome = data.monthlyIncome;
  const monthlyExpense = data.monthlyExpense;
  const userName = isLoggedIn ? data.user!.fullName : 'Tamu FinTrack';

  return (
    <main className="flex-1 w-full">
      {/* 1. Header & User Greeting */}
      <TopAppBar userName={userName} isOnline={true} />

      {/* Guest Mode Notice */}
      {!isLoggedIn && (
        <div className="mx-5 mb-4 rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <LogIn className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  Mode Tamu Aktif
                </p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  Login untuk menyimpan mutasi langsung ke database Supabase Anda.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Masuk
            </Link>
          </div>
        </div>
      )}

      {/* 2. Master Balance Card (Total Net Worth & In/Out Monthly) */}
      <MasterBalanceCard
        totalBalance={totalBalance}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
      />

      {/* 3. Multi-Wallet Carousel */}
      <WalletCarousel wallets={data.wallets} />

      {/* 4. Recent Transactions List */}
      <RecentTransactions transactions={data.recentTransactions} />
    </main>
  );
}
