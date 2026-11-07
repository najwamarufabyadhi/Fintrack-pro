'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const walletSchema = z.object({
  name: z.string().min(2, 'Nama kantong minimal 2 karakter').max(50),
  type: z.enum(['bank', 'ewallet', 'cash', 'investment', 'credit']),
  initial_balance: z.number().min(0, 'Saldo awal tidak boleh negatif'),
  color: z.string().optional().default('#6366F1'),
});

export type CreateWalletInput = z.infer<typeof walletSchema>;

/**
 * Create a new pocket / wallet
 */
export async function createWallet(input: CreateWalletInput) {
  const validated = walletSchema.safeParse(input);
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
    .from('wallets')
    .insert({
      user_id: user.id,
      name: validated.data.name,
      type: validated.data.type,
      initial_balance: validated.data.initial_balance,
      color: validated.data.color,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/wallets');
  revalidatePath('/');
  return { success: true, data };
}
