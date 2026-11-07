import { createClient } from '@/lib/supabase/server';
import { Wallet, Transaction, Category } from '@/lib/types/database';

export interface DashboardData {
  user: {
    id: string;
    email?: string;
    fullName: string;
  } | null;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  wallets: (Wallet & { calculatedBalance: number })[];
  recentTransactions: Transaction[];
  categories: Category[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const demoWallets: (Wallet & { calculatedBalance: number })[] = [
      { id: '1', user_id: 'guest', name: 'BCA Prioritas', type: 'bank', initial_balance: 15000000, calculatedBalance: 16250000, color: 'from-blue-600 to-indigo-700', is_archived: false, created_at: new Date().toISOString() },
      { id: '2', user_id: 'guest', name: 'GoPay Saldo', type: 'ewallet', initial_balance: 2000000, calculatedBalance: 2450000, color: 'from-sky-500 to-blue-600', is_archived: false, created_at: new Date().toISOString() },
      { id: '3', user_id: 'guest', name: 'Kas Tunai Dompet', type: 'cash', initial_balance: 1000000, calculatedBalance: 880000, color: 'from-emerald-600 to-teal-700', is_archived: false, created_at: new Date().toISOString() },
      { id: '4', user_id: 'guest', name: 'Mandiri Bisnis', type: 'bank', initial_balance: 5000000, calculatedBalance: 5000000, color: 'from-amber-600 to-orange-700', is_archived: false, created_at: new Date().toISOString() },
    ];

    return {
      user: null,
      totalBalance: 24580000,
      monthlyIncome: 8500000,
      monthlyExpense: 3250000,
      wallets: demoWallets,
      recentTransactions: [],
      categories: [],
    };
  }

  // 1. Fetch Wallets
  const { data: rawWallets } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: true });

  const wallets: Wallet[] = rawWallets || [];

  // If new user with no wallets yet, auto-create starter pockets
  if (wallets.length === 0) {
    const starterWallets = [
      { user_id: user.id, name: 'BCA Utama', type: 'bank', initial_balance: 12500000, color: 'indigo' },
      { user_id: user.id, name: 'GoPay Saldo', type: 'ewallet', initial_balance: 1750000, color: 'cyan' },
      { user_id: user.id, name: 'Kas Tunai', type: 'cash', initial_balance: 500000, color: 'emerald' },
    ];
    const { data: created } = await supabase.from('wallets').insert(starterWallets).select();
    if (created) wallets.push(...created);
  }

  // 2. Fetch Recent Transactions
  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select(`
      *,
      wallet:wallet_id(name, type, color),
      destination_wallet:destination_wallet_id(name, type, color),
      category:category_id(name, icon)
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  const recentTransactions: Transaction[] = rawTransactions || [];

  // 3. Fetch Monthly Summary View
  const { data: summaryRows } = await supabase
    .from('vw_user_monthly_summary')
    .select('*')
    .eq('user_id', user.id)
    .order('month_year', { ascending: false })
    .limit(1);

  const latestSummary = summaryRows && summaryRows.length > 0 ? summaryRows[0] : null;
  const monthlyIncome = latestSummary ? Number(latestSummary.total_income) : 0;
  const monthlyExpense = latestSummary ? Number(latestSummary.total_expense) : 0;

  // 4. Calculate Net Total Balance & per-wallet calculated balance
  const { data: allMutations } = await supabase
    .from('transactions')
    .select('type, amount, wallet_id, destination_wallet_id')
    .eq('user_id', user.id)
    .is('deleted_at', null);

  const walletBalances: Record<string, number> = {};
  wallets.forEach((w) => {
    walletBalances[w.id] = Number(w.initial_balance);
  });

  let totalBalance = wallets.reduce((acc, w) => acc + Number(w.initial_balance), 0);

  if (allMutations) {
    allMutations.forEach((tx) => {
      const amt = Number(tx.amount);
      if (tx.type === 'income') {
        totalBalance += amt;
        if (walletBalances[tx.wallet_id] !== undefined) {
          walletBalances[tx.wallet_id] += amt;
        }
      } else if (tx.type === 'expense') {
        totalBalance -= amt;
        if (walletBalances[tx.wallet_id] !== undefined) {
          walletBalances[tx.wallet_id] -= amt;
        }
      } else if (tx.type === 'transfer') {
        // Source wallet decreases
        if (walletBalances[tx.wallet_id] !== undefined) {
          walletBalances[tx.wallet_id] -= amt;
        }
        // Destination wallet increases
        if (tx.destination_wallet_id && walletBalances[tx.destination_wallet_id] !== undefined) {
          walletBalances[tx.destination_wallet_id] += amt;
        }
      }
    });
  }

  const walletsWithCalculated: (Wallet & { calculatedBalance: number })[] = wallets.map((w) => ({
    ...w,
    calculatedBalance: walletBalances[w.id] ?? Number(w.initial_balance),
  }));

  // 5. Fetch Categories
  const { data: rawCategories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  const categories: Category[] = rawCategories || [];

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Pengguna FinTrack',
    },
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    wallets: walletsWithCalculated,
    recentTransactions,
    categories,
  };
}
