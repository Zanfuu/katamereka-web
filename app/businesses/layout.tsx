import type { Metadata } from "next";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Daftar Bisnis Terpercaya di Indonesia — Ulasan & Rating | Katamereka",
  description:
    "Jelajahi direktori bisnis di Indonesia lengkap dengan rating, ulasan nyata pelanggan, kategori, dan lokasi. Pilih bisnis berdasarkan pengalaman pengguna.",
  url: `${CONSUMER_SITE_URL}/businesses`,
});

export default function BusinessesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
