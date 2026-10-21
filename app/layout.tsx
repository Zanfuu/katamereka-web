import type { Metadata } from "next";
import { Poppins, Gabarito } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { CONSUMER_SITE_URL } from "@/lib/site-config";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const gabarito = Gabarito({
  variable: "--font-gabarito",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

// No `alternates.canonical` here: a layout-level canonical is inherited by every
// route that doesn't set its own, which would point them all at the home page.
// Each public route sets its own canonical (see lib/seo-metadata.ts).
export const metadata: Metadata = {
  metadataBase: new URL(CONSUMER_SITE_URL),
  title: "Katamereka — Dengarkan Ulasan Sebelum Memilih Bisnis",
  description: "Temukan bisnis terpercaya berdasarkan pengalaman nyata pelanggan.",
  openGraph: {
    siteName: "Katamereka",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={`${poppins.variable} ${gabarito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
