export type WalletType = 'bank' | 'ewallet' | 'cash' | 'investment' | 'credit';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Profile {
  id: string;
  full_name: string | null;
  base_currency: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: WalletType;
  initial_balance: number;
  color: string;
  is_archived: boolean;
  created_at: string;
  current_balance?: number; // Computed balance from initial_balance + net transactions
}

export interface Category {
  id: string;
  user_id: string | null; // null for system defaults
  name: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  destination_wallet_id?: string | null;
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  description?: string | null;
  transaction_date: string;
  deleted_at?: string | null;
  created_at: string;

  // Joined relations for UI presentation
  wallet?: Pick<Wallet, 'name' | 'type' | 'color'>;
  destination_wallet?: Pick<Wallet, 'name' | 'type' | 'color'>;
  category?: Pick<Category, 'name' | 'icon'>;
}

export interface MonthlySummary {
  user_id: string;
  month_year: string;
  total_income: number;
  total_expense: number;
  net_cashflow: number;
}

