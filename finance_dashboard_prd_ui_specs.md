# Product Requirement Document (PRD) & Industry-Grade Architecture
## Project: FinTrack Pro – Enterprise-Grade Personal & Multi-Account Financial Engine

---

## 1. Executive Summary & Industry Standard Alignment
**FinTrack Pro** adalah aplikasi web pencatatan dan analitik keuangan *mobile-first*, *accessible*, dan *real-time*. Berbeda dengan prototipe tutorial biasa, FinTrack Pro dirancang mengikuti standar industri fintech:
- **Financial Integrity & Auditability:** Tidak menggunakan *hard delete* langsung pada transaksi, melainkan pembukuan berbasis log mutasi (*immutable ledger pattern*) dengan *soft-delete*.
- **Database-Level Performance:** Seluruh agregasi metrik (Total Saldo, Arus Kas Bulanan, Rasio Belanja) dihitung di PostgreSQL (Database Views/Aggregates), bukan diproses di browser klien.
- **Strict Multi-tenant Security:** Otentikasi dan isolasi data per akun melalui Supabase Row-Level Security (RLS).
- **Design System Ergonomics:** Tampilan mobile-friendly terinspirasi sistem **Minimal Clean / iOS Floating Dock with Center Action FAB** yang mengutamakan kecepatan input transaksi dan keterbacaan data numerik.

---

## 2. UI/UX Design System (Mobile-Friendly & Accessible)

### 2.1 Navigation Architecture (Based on UI Ref: Style 03 / 06 / 11)
Mengadopsi pola **Bottom Floating Navigation Dock with Center FAB**:
- **Thumb-Friendly Navigation:** Bar navigasi bawah melayang (*floating bottom dock*) dengan sudut lengkung halus (`rounded-full` / `rounded-2xl`) dan efek *frosted glass* halus (`backdrop-blur-md bg-white/85 dark:bg-slate-900/85`).
- **Primary Center FAB (Action-Focused):** Tombol bulat menonjol di tengah dengan ikon `+` bergradien kontras untuk memicu modal **"Quick Record Transaction"** hanya dalam 1 ketukan.
- **Tab Items:**
  1. **Home:** Overview ringkasan saldo, health score, & arus kas.
  2. **Analytics:** Visualisasi kategori, breakdown pengeluaran, tren 6 bulan.
  3. **[Center FAB]:** Tombol aksi tambah pemasukan/pengeluaran cepat.
  4. **Wallets:** Pengelolaan multi-rekening & kartu (Bank, E-Wallet, Cash).
  5. **Settings:** Preferensi mata uang, ekspor data, & profil.

### 2.2 Design Tokens & Ergonomics
- **Color Palette (Accessible & WCAG AA Compliant):**
  - **Background:** `#F8FAFC` (Slate 50) untuk Light Mode / `#0F172A` (Slate 900) untuk Dark Mode.
  - **Card Surface:** `#FFFFFF` (Pure White) berbayang halus (`shadow-sm border border-slate-200/80`).
  - **Accent Primary (Action / Brand):** `#4F46E5` (Indigo 600) ke `#6366F1` (Indigo 500).
  - **Positive (Income / Surplus):** `#059669` (Emerald 600).
  - **Negative (Expense / Debt):** `#E11D48` (Rose 600).
- **Typography:**
  - Font Sistem: `Inter`, `Plus Jakarta Sans`, atau `SF Pro Display`.
  - Nominal Keuangan: `font-mono tracking-tight font-semibold tabular-nums` (mencegah teks bergeser saat nilai berubah).
- **Minimum Tap Area:** Mematuhi standar Apple HIG dan Material Design: minimal `48x48px` untuk setiap elemen interaktif di perangkat mobile.

---

## 3. Tech Stack & Cloud Infrastructure

- **Frontend Core:** Next.js 15 (App Router, Server Components & Server Actions)
- **Styling & UI Kit:** Tailwind CSS v4, shadcn/ui (Radix Primitives)
- **Icons & Motion:** Lucide React, Framer Motion (untuk animasi dock & modal)
- **Charts & Data Viz:** Tremor Raw / Recharts (Responsive mobile-first container)
- **Database & Auth:** Supabase (PostgreSQL 15+, Supabase Auth SSR, Storage, RLS)
- **Validation & Safe Types:** Zod, TypeScript Strict Mode
- **Deployment & Edge CDN:** Vercel (Production CI/CD, Edge Middleware)

---

## 4. Industry-Grade Functional Specifications

### 4.1 Transaction Engine with Audit Trail
- **Double Record Classification:** Mendukung `income`, `expense`, dan `transfer` antar-kantong (misal: Transfer dari BCA ke GoPay tidak dihitung sebagai beban pengeluaran).
- **Soft Delete Mechanism:** Menghapus transaksi tidak menghilangkannya dari database, melainkan mengubah status `deleted_at = NOW()`.
- **Receipt / Bukti Transaksi Attachment (Optional via Supabase Storage):** Dukungan upload struk belanja/nota (.jpg, .png, .pdf).

### 4.2 Multi-Account / Multi-Wallet Management
- Pengguna dapat membagi keuangan dalam beberapa kantong (*Wallets/Pockets*):
  - *Main Bank Account* (BCA, Mandiri, BRI)
  - *Digital Wallets* (GoPay, OVO, ShopeePay)
  - *Emergency Fund / Cold Storage*
- Transaksi otomatis mengupdate saldo kalkulasi (*calculated ledger balance*) rekening terkait secara atomik via SQL Transaction.

### 4.3 Data Export & Portability (Kepatuhan Finansial)
- Fitur ekspor laporan mutasi ke format **CSV** dan **Excel (.xlsx)** berdasarkan rentang tanggal tertentu.

---

## 5. Database Schema & SQL Architecture (Supabase)

Skema database berikut dirancang dengan integritas data finansial, *indexes* untuk kueri cepat, dan *Row Level Security*:

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  base_currency VARCHAR(3) DEFAULT 'IDR' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Wallets / Accounts Table
CREATE TABLE public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('bank', 'ewallet', 'cash', 'investment', 'credit')) NOT NULL,
  initial_balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  color VARCHAR(20) DEFAULT '#6366F1',
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Categories Table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE, -- NULL = System default
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(30) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL
);

-- 4. Transactions Table (Immutable-focused with Soft Delete)
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.wallets ON DELETE RESTRICT NOT NULL,
  destination_wallet_id UUID REFERENCES public.wallets ON DELETE RESTRICT, -- Jika type = 'transfer'
  category_id UUID REFERENCES public.categories ON DELETE SET NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  deleted_at TIMESTAMPTZ, -- Soft delete flag
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance Indexes
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_wallet ON public.transactions(wallet_id) WHERE deleted_at IS NULL;

-- 5. Database View for Fast Performance Aggregations
CREATE OR REPLACE VIEW public.vw_user_monthly_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', transaction_date) AS month_year,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS net_cashflow
FROM public.transactions
WHERE deleted_at IS NULL AND type != 'transfer'
GROUP BY user_id, DATE_TRUNC('month', transaction_date);

-- 6. Row Level Security (RLS) Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own profiles"
  ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own wallets"
  ON public.wallets FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view default categories or own"
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own categories"
  ON public.categories FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL USING (auth.uid() = user_id);
```

---

## 6. Implementation Roadmap & Development Sprints

### Sprint 1: Setup & Data Layer (Core Security)
- Setup Next.js 15 repository dengan TypeScript, Tailwind CSS, dan shadcn/ui.
- Deploy database Supabase, pasang schema SQL dan policies RLS.
- Buat autentikasi Supabase SSR (Login, Register, Logout).

### Sprint 2: Mobile UI Framework & Dock Navigation
- Implementasikan layout navigasi:
  - Desktop: Sidebar minimalis.
  - Mobile: Floating Dock Navigation (Pill indicator + Center FAB).
- Bangun modal pop-up "Quick Add Transaction" yang responsif dan cepat diketik melalui HP.

### Sprint 3: Ledger Logic & Multi-Wallet Support
- Buat sistem CRUD transaksi dengan mutasi saldo real-time.
- Integrasi transfer antar dompet/rekening.
- Implementasi *soft delete* dan restore transaksi.

### Sprint 4: Performance Analytics & Visual Data
- Hubungkan view `vw_user_monthly_summary` ke charting component.
- Visualisasikan donat alokasi kategori pengeluaran dan bar perbandingan arus kas.
- Fitur ekspor CSV / Excel.

### Sprint 5: Production Deployment & Hardening
- Hubungkan repository GitHub ke Vercel.
- Konfigurasi environment variables & uji latency edge.
- Audit Lighthouse (Performance 95+, Accessibility 100, Best Practices 100).