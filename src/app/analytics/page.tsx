import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fallback demo data for guest or initial state
  const defaultMonthly = [
    { month: 'Jun', pemasukan: 7200000, pengeluaran: 3100000 },
    { month: 'Jul', pemasukan: 7500000, pengeluaran: 3400000 },
    { month: 'Agu', pemasukan: 8000000, pengeluaran: 2900000 },
    { month: 'Sep', pemasukan: 8200000, pengeluaran: 3600000 },
    { month: 'Okt', pemasukan: 8500000, pengeluaran: 3150000 },
    { month: 'Nov', pemasukan: 8500000, pengeluaran: 3250000 },
  ];

  const defaultCategories = [
    { name: 'Makanan & Minuman', value: 1300000, percentage: 40, color: '#4F46E5' },
    { name: 'Tagihan & Utilitas', value: 812500, percentage: 25, color: '#06B6D4' },
    { name: 'Belanja & Groceries', value: 650000, percentage: 20, color: '#10B981' },
    { name: 'Transportasi', value: 487500, percentage: 15, color: '#F59E0B' },
  ];

  if (!user) {
    return (
      <main className="flex-1 w-full px-5 pt-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Analisis & Arus Kas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown pengeluaran dan rasio keuangan Anda
          </p>
        </div>
        <AnalyticsCharts
          monthlyData={defaultMonthly}
          categoryData={defaultCategories}
          totalIncome={8500000}
          totalExpense={3250000}
        />
      </main>
    );
  }

  // 2. Fetch User's 6-Month Summaries
  const { data: rawSummaries } = await supabase
    .from('vw_user_monthly_summary')
    .select('*')
    .eq('user_id', user.id)
    .order('month_year', { ascending: true })
    .limit(6);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const monthlyData =
    rawSummaries && rawSummaries.length > 0
      ? rawSummaries.map((s) => {
          const d = new Date(s.month_year);
          return {
            month: monthNames[d.getMonth()],
            pemasukan: Number(s.total_income) || 0,
            pengeluaran: Number(s.total_expense) || 0,
          };
        })
      : defaultMonthly;

  // 3. Fetch Category breakdown for current month expenses
  const { data: rawExpenses } = await supabase
    .from('transactions')
    .select(`
      amount,
      category:category_id(name)
    `)
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .is('deleted_at', null);

  const categoryMap: Record<string, number> = {};
  let totalExpense = 0;

  if (rawExpenses && rawExpenses.length > 0) {
    rawExpenses.forEach((tx) => {
      const amt = Number(tx.amount);
      totalExpense += amt;
      const catName = (tx.category as unknown as { name?: string })?.name || 'Lain-lain';
      categoryMap[catName] = (categoryMap[catName] || 0) + amt;
    });
  }

  const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const categoryData =
    totalExpense > 0
      ? Object.entries(categoryMap).map(([name, value], idx) => ({
          name,
          value,
          percentage: Math.round((value / totalExpense) * 100),
          color: COLORS[idx % COLORS.length],
        }))
      : defaultCategories;

  // Latest monthly total income
  const latestSummary = rawSummaries && rawSummaries.length > 0 ? rawSummaries[rawSummaries.length - 1] : null;
  const totalIncome = latestSummary ? Number(latestSummary.total_income) : 8500000;
  const displayExpense = totalExpense > 0 ? totalExpense : 3250000;

  return (
    <main className="flex-1 w-full px-5 pt-6 pb-20">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Analisis & Arus Kas
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Breakdown pengeluaran dan rasio keuangan Anda
        </p>
      </div>

      <AnalyticsCharts
        monthlyData={monthlyData}
        categoryData={categoryData}
        totalIncome={totalIncome}
        totalExpense={displayExpense}
      />
    </main>
  );
}
