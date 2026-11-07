import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingDock } from "@/components/navigation/FloatingDock";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinTrack Pro – Multi-Account Financial Engine",
  description: "Enterprise-grade personal & multi-account financial tracking engine",
  applicationName: "FinTrack Pro",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinTrack Pro",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20`}
      >
        <div className="mx-auto min-h-screen max-w-md md:max-w-4xl relative flex flex-col safe-dock-pb">
          {children}
          {/* Floating Mobile/Tablet Navigation Dock */}
          <FloatingDock />
        </div>
      </body>
    </html>
  );
}
