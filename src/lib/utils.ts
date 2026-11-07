import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numeric value to Indonesian Rupiah currency string
 * e.g. 24580000 -> "Rp 24.580.000"
 */
export function formatIDR(amount: number, includePrefix = true): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  if (!includePrefix) return formatted;
  return amount < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Format date to standard Indonesian localized format
 * e.g. 2026-11-06 -> "06 Nov 2026"
 */
export function formatDateID(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Maps short wallet color tokens to full Tailwind CSS gradient classes.
 * Kept short (e.g. 'indigo', 'cyan') to fit VARCHAR(20) database column.
 */
export function getWalletGradient(color?: string): string {
  switch (color) {
    case 'indigo':
    case 'from-blue-600 to-indigo-700':
      return 'from-blue-600 to-indigo-700';
    case 'cyan':
    case 'from-sky-500 to-blue-600':
      return 'from-sky-500 to-blue-600';
    case 'emerald':
    case 'from-emerald-600 to-teal-700':
      return 'from-emerald-600 to-teal-700';
    case 'amber':
    case 'from-amber-600 to-orange-700':
      return 'from-amber-600 to-orange-700';
    case 'rose':
    case 'from-rose-600 to-pink-700':
      return 'from-rose-600 to-pink-700';
    case 'violet':
    case 'from-purple-600 to-indigo-800':
      return 'from-purple-600 to-indigo-800';
    default:
      if (color && color.startsWith('from-')) return color;
      return 'from-blue-600 to-indigo-700';
  }
}
