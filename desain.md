# UI/UX Design System & Specification
## Project: FinTrack Pro Mobile-First Financial Dashboard

---

## 1. Design Philosophy & Guidelines

Aplikasi mengusung pendekatan **Accessible Modern Fintech** yang menggabungkan estetika bersih (*clean minimal*), ergonomi penggunaan satu tangan (*thumb-friendly*), dan keterbacaan data numerik berstandar industri perbankan/fintech modern (seperti Revolut, Wise, Monzo).

### Core Principles
1. **Legibility & Precision:** Angka nominal uang harus tegas, tidak blur, dan menggunakan font angka tabular agar tidak bergeser saat nilai berubah (*no layout shift*).
2. **Thumb-Zone Optimization:** Aksi frekuensi tinggi (seperti mencatat transaksi baru) ditempatkan tepat di area jangkauan jempol bawah layar via **Center Action FAB**.
3. **Restraint Glassmorphism:** Efek blur halus digunakan secara terukur pada bar navigasi bawah untuk memberikan kesan modern melayang tanpa mengorbankan performa *rendering* di perangkat *mobile*.
4. **Accessibility (WCAG AA Compliant):** Rasio kontras teks utama minimal `4.5:1` terhadap latar belakang.

---

## 2. Design Tokens

### 2.1 Color Palette

| Token Name | Hex Code | Utility Class (Tailwind) | Usage |
|---|---|---|---|
| **Canvas Light** | `#F8FAFC` | `bg-slate-50` | Latar belakang utama aplikasi (Light) |
| **Canvas Dark** | `#0F172A` | `bg-slate-900` | Latar belakang utama aplikasi (Dark) |
| **Card Surface** | `#FFFFFF` | `bg-white dark:bg-slate-800` | Kartu konten, saldo, dan list transaksi |
| **Brand Primary** | `#4F46E5` | `bg-indigo-600` | Tombol utama, active state icon, brand highlight |
| **Brand Accent (FAB)**| `#6366F1` | `bg-indigo-500` | Floating Action Button (+) di dock tengah |
| **Positive / Income** | `#059669` | `text-emerald-600 bg-emerald-50` | Nominal uang masuk, badge kenaikan saldo |
| **Negative / Expense**| `#E11D48` | `text-rose-600 bg-rose-50` | Nominal uang keluar, badge pengeluaran |
| **Transfer / Neutral**| `#2563EB` | `text-blue-600 bg-blue-50` | Mutasi antar rekening dompet |
| **Border & Divider** | `#E2E8F0` | `border-slate-200 dark:border-slate-700/60` | Pemisah baris dan bingkai kartu |
| **Text Primary** | `#0F172A` | `text-slate-900 dark:text-slate-50` | Heading dan nominal saldo utama |
| **Text Muted** | `#64748B` | `text-slate-500 dark:text-slate-400` | Label kategori, tanggal, subtitle |

### 2.2 Typography Scale

* **Primary Font:** Inter, Plus Jakarta Sans, atau SF Pro Display (`font-sans`).
* **Financial Numbers:** `font-mono tracking-tight tabular-nums` (wajib untuk angka transaksi).

| Elemen | Ukuran | Bobot | Class Utility |
|---|---|---|---|
| Large Balance Display | 32px - 36px | Bold (700) | `text-3xl font-bold font-mono tracking-tight` |
| Section Header | 18px - 20px | Semi-Bold (600) | `text-lg font-semibold tracking-tight` |
| Card Title / Category | 15px - 16px | Medium (500) | `text-base font-medium text-slate-800` |
| Transaction Amount | 15px - 16px | Semi-Bold (600) | `text-base font-semibold font-mono tabular-nums` |
| Caption / Timestamp | 12px - 13px | Regular (400) | `text-xs text-slate-500` |

### 2.3 Elevations & Radii

* **Card Corner:** `rounded-2xl` (16px) untuk kartu informasi dan widget.
* **Modal / Bottom Sheet Corner:** `rounded-t-3xl` (24px) untuk form input transaksi.
* **Floating Dock Corner:** `rounded-full` (9999px) atau `rounded-2xl` (16px).
* **Card Elevation:** `shadow-sm hover:shadow-md transition-shadow`
* **Floating Dock Shadow:** `shadow-lg shadow-slate-900/10 dark:shadow-black/40`

---

## 3. Navigation Component: Floating Bottom Dock + Center FAB

Navigasi mengacu pada referensi visual modern dock style yang ergonomis.

```
+-------------------------------------------------------------+
|                          CONTENT                            |
|                                                             |
+-------------------------------------------------------------+
|     +-------------------------------------------------+     |
|     |  [Home]   [Analytics]   ( + )   [Wallets] [Settings] |     |
|     +-------------------------------------------------+     |
+-------------------------------------------------------------+
```

### 3.1 Spesifikasi Dimensi & Struktur
* **Position:** `fixed bottom-5 left-1/2 -translate-x-1/2 z-50`
* **Width:** `w-[92%] max-w-md` (Responsif ponsel, tidak menabrak bezel layar)
* **Height:** `h-16` (64px)
* **Surface Style:**
  - `bg-white/85 dark:bg-slate-900/85 backdrop-blur-md`
  - `border border-slate-200/80 dark:border-slate-800/80`
  - `rounded-full px-4 flex items-center justify-between shadow-xl shadow-slate-900/10`

### 3.2 Center FAB (Quick Add Button)
* **Position:** Terletak tepat di tengah bar navigasi, sedikit menonjol ke atas (*elevated center button*).
* **Ukuran:** `w-12 h-12` (48px x 48px) - Memenuhi standar minimum *touch target area*.
* **Visual:**
  - `bg-indigo-600 hover:bg-indigo-700 text-white rounded-full`
  - `shadow-lg shadow-indigo-500/30 flex items-center justify-center`
  - Ikon: `Plus` (Lucide React) `w-6 h-6 stroke-[2.5]`
* **Interaksi:** Ketukan membuka *Bottom Sheet Modal* untuk mencatat pemasukan/pengeluaran baru secara instan.

### 3.3 Tab Items (4 Navigasi Samping)
1. **Home (`/dashboard`):** Ikon `Home` + label/indikator titik aktif di bawahnya.
2. **Analytics (`/analytics`):** Ikon `PieChart` atau `BarChart3`.
3. **Wallets (`/wallets`):** Ikon `WalletCards`.
4. **Settings (`/settings`):** Ikon `SlidersHorizontal` atau `User`.

*Status Aktif (Active State):* Ikon berwarna `text-indigo-600 dark:text-indigo-400` dengan titik indikator kecil berdiameter 4px di bawah ikon.  
*Status Tidak Aktif (Inactive State):* Ikon berwarna `text-slate-400 hover:text-slate-600 dark:text-slate-500`.

---

## 4. Key Screen Layouts & Components

### 4.1 Home Screen (Dashboard Overview)
* **Top App Bar:** 
  - Kiri: Greeting singkat ("Halo, [Nama]") + Status sinkronisasi offline/online.
  - Kanan: Avatar foto profil + Notifikasi bell badge.
* **Master Balance Card:**
  - Total Saldo Bersih (*Net Worth*) dalam format IDR besar (`Rp 24.580.000`).
  - Ringkasan mini dua kolom di bawahnya:
    - Pemasukan Bulan Ini (dengan panah naik hijau `+ Rp 8.500.000`).
    - Pengeluaran Bulan Ini (dengan panah turun merah `- Rp 3.250.000`).
* **Wallet Carousel (Horizontal Scroll):**
  - Kartu geser ringkas untuk masing-masing dompet: Bank BCA, GoPay, Dompet Tunai.
* **Recent Activity Section:**
  - Header list dengan link "Lihat Semua".
  - Baris item transaksi: Ikon kategori berbentuk lingkaran, judul transaksi, jam/tanggal, dan nominal dengan warna status (+/-).

### 4.2 Quick Add Transaction Modal (Bottom Sheet)
* **Header:** Pilihan segmen (*segmented control*): `Pengeluaran` | `Pemasukan` | `Transfer`.
* **Field Nominal Besar:** Input teks ukuran jumbo di tengah (`Rp 0`), fokus keyboard numerik otomatis terbuka.
* **Field Dompet & Kategori:** Dropdown berbentuk chips/pills horizontal agar cepat dipilih dengan satu tap jempol.
* **Tanggal & Catatan:** Input tanggal instan (default: Hari ini) dan input teks catatan ringkas opsional.
* **Primary Button:** Tombol "Simpan Transaksi" di bagian paling bawah dengan lebar penuh (`w-full py-3.5 rounded-xl font-semibold`).

### 4.3 Analytics & Cash Flow Screen
* **Monthly Bar Chart (Cash Flow):** Menampilkan tren pemasukan vs pengeluaran 6 bulan terakhir.
* **Category Breakdown (Donut Chart):** Visualisasi persentase belanja bulanan (Makanan 40%, Tagihan 25%, Transportasi 15%, dll).

---

## 5. Micro-Interactions & Animation Guidelines

* **Button Press Feedback:** Semua tombol interaktif menggunakan efek skala lembut saat ditekan: `active:scale-95 transition-transform duration-150`.
* **Dock Tab Transition:** Indikator titik aktif bertransisi menggunakan efek animasi layout halus (misal `layoutId="activeIndicator"` di Framer Motion).
* **Modal In/Out:** Bottom sheet muncul dari bawah ke atas (`slide-in-from-bottom duration-200`) dan tertutup dengan *swipe-down gesture*.
* **Haptic / Visual Tone:** Hindari animasi berlebih yang memperlambat alur pencatatan; utamakan kecepatan respons (*snappy feel*).