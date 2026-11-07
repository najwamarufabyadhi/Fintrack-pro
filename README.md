# FinTrack Pro 🚀
> **Enterprise-Grade Personal & Multi-Account Financial Engine**  
> Mobile-first, accessible, real-time financial tracker & analytics platform.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![React](https://img.shields.io/badge/React-19-cyan.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-blueviolet.svg)
![Supabase](https://img.shields.io/badge/Database-Supabase-emerald.svg)

---

## 🌟 Fitur Utama (Core Features)

1. **Thumb-Friendly Floating Bottom Dock & Center FAB:**
   - Navigasi melayang berkapsul (*pill dock*) dengan efek *frosted glass* halus (`backdrop-blur-md`).
   - Tombol tengah FAB bergradien indigo untuk mencatat transaksi dalam 1 ketukan.
2. **Quick Add Transaction Modal:**
   - Segmented switch 3 mode: **Pengeluaran** (Rose), **Pemasukan** (Emerald), dan **Transfer** (Blue).
   - Input angka nominal jumbo dengan auto-focus dan format instan Rupiah Indonesia (`Rp 0`).
   - Selektor dompet & kategori belanja berbentuk *chips/pills* horizontal ramah jempol.
3. **Financial Integrity & Immutable Ledger Pattern:**
   - **Soft Delete Mechanism:** Transaksi yang dihapus diberi timestamp `deleted_at = NOW()`, dengan opsi *Undo / Restore* instan.
   - **Double Record Classification:** Transaksi transfer saldo antar-rekening (contoh: BCA ke GoPay) tidak dihitung sebagai beban pengeluaran di laporan arus kas bulanan.
4. **Performa Tinggi di Level Database (PostgreSQL):**
   - Agregasi saldo dan arus kas bulanan dihitung di PostgreSQL melalui SQL View `vw_user_monthly_summary` dengan *partial index* khusus (`WHERE deleted_at IS NULL`).
5. **Keamanan Multi-Tenant Ketat:**
   - Proteksi data per pengguna menggunakan **Supabase Row-Level Security (RLS)** pada setiap tabel.
6. **Visualisasi Data Finansial (Recharts):**
   - Grafik batang tren arus kas 6 bulan (Pemasukan vs Pengeluaran).
   - Diagram donat alokasi kategori belanja dengan persentase dan warna kontras WCAG AA.
7. **Ekspor Data Portabel (Siap Audit):**
   - Ekspor seluruh mutasi rekening ke format **Excel (.xlsx)** dan **CSV**.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, React Server Components, Server Actions)
- **Runtime & UI:** React 19, TypeScript Strict Mode
- **Styling & Tokens:** Tailwind CSS v4, Lucide Icons, Framer Motion
- **Data Visualization:** Recharts
- **Database & Auth:** Supabase (PostgreSQL 15+, Auth SSR, RLS)
- **Validation:** Zod
- **Spreadsheet Engine:** XLSX

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat
- Node.js versi 20+ atau 22+ (LTS)
- Akun di [Supabase](https://supabase.com)

### 2. Kloning & Instalasi Dependensi
```bash
git clone <repository-url>
cd "Finance Dashboard"
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Lalu isi kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
```

### 4. Eksekusi Skema Database
Buka **SQL Editor** di dashboard Supabase Anda, lalu jalankan secara berurutan berkas:
1. `supabase/migrations/01_init_schema.sql` (Tabel, Index, Views, dan RLS Policies)
2. `supabase/seed.sql` (Data awal 12 kategori sistem)

### 5. Jalankan Server Development Lokal
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser laptop atau [http://<ip-lokal>:3000](http://localhost:3000) di smartphone Anda.

---

## 🚢 Panduan Deployment ke Vercel (Production)

1. **Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete FinTrack Pro enterprise financial dashboard"
   git branch -M main
   git remote add origin <url-repo-github-anda>
   git push -u origin main
   ```
2. **Impor ke Vercel:**
   - Buka [vercel.com](https://vercel.com) dan klik **Add New Project**.
   - Pilih repository GitHub FinTrack Pro Anda.
   - Tambahkan Environment Variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Klik **Deploy**.
3. Selesai! Aplikasi Anda langsung live dengan performa edge CDN global.
