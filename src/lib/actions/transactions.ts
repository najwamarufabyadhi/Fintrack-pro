'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Wallet, Category } from '@/lib/types/database';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive('Nominal harus lebih dari 0'),
  wallet_id: z.string().uuid('Pilih dompet yang valid'),
  destination_wallet_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().max(255).optional().nullable(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
});

export type CreateTransactionInput = z.infer<typeof transactionSchema>;

/**
 * Record a new financial mutation (Income, Expense, or Transfer)
 */
export async function createTransaction(input: CreateTransactionInput) {
  const validated = transactionSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((e) => e.message).join(', '),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sesi kedaluwarsa. Silakan login kembali.' };
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type: validated.data.type,
      amount: validated.data.amount,
      wallet_id: validated.data.wallet_id,
      destination_wallet_id: validated.data.type === 'transfer' ? validated.data.destination_wallet_id : null,
      category_id: validated.data.type !== 'transfer' ? validated.data.category_id : null,
      description: validated.data.description,
      transaction_date: validated.data.transaction_date,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting transaction:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/analytics');
  revalidatePath('/wallets');

  return { success: true, data };
}

/**
 * Soft Delete Transaction (Preserves audit trail)
 */
export async function softDeleteTransaction(transactionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sesi tidak valid.' };
  }

  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', transactionId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/analytics');
  return { success: true };
}

/**
 * Restore a soft-deleted transaction
 */
export async function restoreTransaction(transactionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sesi tidak valid.' };
  }

  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: null })
    .eq('id', transactionId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/analytics');
  return { success: true };
}

/**
 * Fetch real user wallets and system categories for Quick Add form
 */
export async function getWalletsAndCategories() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { wallets: [], categories: [] };
  }

  const { data: rawWallets } = await supabase
    .from('wallets')
    .select('id, name, type, color, initial_balance')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: true });

  // Deduplicate
  const uniqueWallets: Pick<Wallet, 'id' | 'name' | 'type' | 'color' | 'initial_balance'>[] = [];
  const seen = new Set<string>();
  for (const w of rawWallets || []) {
    if (!seen.has(w.name.trim().toLowerCase())) {
      seen.add(w.name.trim().toLowerCase());
      uniqueWallets.push(w);
    }
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon, type')
    .order('name', { ascending: true });

  return {
    wallets: uniqueWallets,
    categories: (categories as Category[]) || [],
  };
}
