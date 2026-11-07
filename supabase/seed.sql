-- ==============================================================================
-- FinTrack Pro - Seed Data: Standard Default System Categories
-- user_id is NULL so all users have access via RLS policy
-- ==============================================================================

INSERT INTO public.categories (user_id, name, icon, type)
VALUES
  -- Pengeluaran (Expense)
  (NULL, 'Makanan & Minuman', 'Utensils', 'expense'),
  (NULL, 'Belanja & Groceries', 'ShoppingBag', 'expense'),
  (NULL, 'Tagihan & Utilitas', 'Receipt', 'expense'),
  (NULL, 'Transportasi', 'Car', 'expense'),
  (NULL, 'Hiburan & Hobi', 'Film', 'expense'),
  (NULL, 'Kesehatan & Medis', 'HeartPulse', 'expense'),
  (NULL, 'Pendidikan', 'GraduationCap', 'expense'),
  (NULL, 'Keluarga & Anak', 'Users', 'expense'),
  (NULL, 'Lain-lain', 'MoreHorizontal', 'expense'),

  -- Pemasukan (Income)
  (NULL, 'Gaji Utama', 'Briefcase', 'income'),
  (NULL, 'Bonus & Tunjangan', 'Gift', 'income'),
  (NULL, 'Hasil Investasi', 'TrendingUp', 'income'),
  (NULL, 'Freelance & Bisnis', 'Laptop', 'income'),
  (NULL, 'Pemasukan Lainnya', 'PlusCircle', 'income')
ON CONFLICT DO NOTHING;

