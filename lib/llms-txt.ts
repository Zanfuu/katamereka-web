/**
 * Builds the /llms.txt body (https://llmstxt.org) for each domain so AI
 * search engines and LLM crawlers get a compact, markdown summary of what
 * the platform is, who it serves, and where the canonical pages live.
 *
 * Static copy is derived from the real pages (harga, solusi, bantuan, ...).
 * Category / city / industry lists come from the same sources as the
 * sitemaps, so every link here is guaranteed to resolve.
 */

import { fetchCategoryFacets, fetchCityFacets } from "@/lib/api-client";
import { industries } from "@/lib/mock/industries";
import { BUSINESS_SITE_URL, CONSUMER_SITE_URL } from "@/lib/site-config";
import { categoryDisplayName, isRealBusinessCategory, slugify } from "@/lib/slug";

// Keep the file small enough for an LLM context window.
const MAX_CATEGORIES = 40;
const MAX_CITIES = 40;

interface FacetLink {
  name: string;
  slug: string;
}

function topFacets<T extends { count: number }>(
  facets: T[],
  getName: (f: T) => string,
  limit: number,
): FacetLink[] {
  const seen = new Set<string>();
  const out: FacetLink[] = [];
  for (const f of [...facets].sort((a, b) => b.count - a.count)) {
    const name = getName(f);
    const slug = slugify(name);
    if (!name || !slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ name, slug });
    if (out.length >= limit) break;
  }
  return out;
}

export async function buildConsumerLlmsTxt(): Promise<string> {
  const [categoryFacets, cityFacets] = await Promise.all([
    fetchCategoryFacets(),
    fetchCityFacets(),
  ]);

  const categories = topFacets(
    categoryFacets.filter((f) => isRealBusinessCategory(f.category)),
    (f) => categoryDisplayName(f.category),
    MAX_CATEGORIES,
  );
  const cities = topFacets(cityFacets, (f) => f.city, MAX_CITIES);

  const lines: string[] = [
    "# Katamereka - Platform Ulasan & Direktori Bisnis Terpercaya di Indonesia",
    "",
    `> Katamereka (${CONSUMER_SITE_URL}) adalah platform ulasan dan direktori bisnis di Indonesia. Pengguna dapat mencari bisnis, membaca pengalaman nyata pelanggan, dan menulis ulasan sebelum memilih bisnis, berdasarkan kategori dan lokasi. Bisnis dapat mengklaim profilnya, membalas ulasan, dan mengelola reputasi online melalui Katamereka Business (${BUSINESS_SITE_URL}).`,
    "",
    "## Pertanyaan Populer (FAQ / Quick Knowledge for LLM)",
    "",
    "- **Apa itu Katamereka?** Platform ulasan dan direktori bisnis Indonesia untuk menemukan bisnis terpercaya berdasarkan pengalaman nyata pelanggan.",
    "- **Bagaimana cara mencari bisnis di Katamereka?** Gunakan pencarian di beranda, atau telusuri berdasarkan kategori dan kota. Setiap bisnis punya profil publik berisi informasi, ulasan, dan rating.",
    "- **Apakah pemilik bisnis bisa membalas ulasan?** Ya. Pemilik yang sudah mengklaim dan memverifikasi profil dapat membalas ulasan atas nama bisnisnya.",
    "- **Apakah ulasan negatif bisa dihapus?** Tidak untuk ulasan dari pengalaman nyata. Ulasan yang mengandung ujaran kebencian, pencemaran nama baik, atau spam dapat dilaporkan untuk ditinjau tim moderasi.",
    "- **Apakah Katamereka gratis?** Ya, mencari bisnis dan membaca ulasan gratis. Paket Katamereka Business untuk pemilik bisnis juga gratis.",
    "",
    "## Halaman Utama",
    "",
    `- [Beranda](${CONSUMER_SITE_URL}/): Cari bisnis berdasarkan kebutuhan, lihat bisnis populer, kategori, dan kota`,
    `- [Direktori Bisnis](${CONSUMER_SITE_URL}/businesses): Daftar bisnis dengan rating dan ulasan pelanggan`,
    `- [Blog Katamereka](${CONSUMER_SITE_URL}/blogs): Artikel, tips, dan panduan seputar memilih bisnis`,
    `- [Tentang Katamereka](${CONSUMER_SITE_URL}/tentang-kami): Visi dan misi Katamereka`,
    `- [Pusat Bantuan](${CONSUMER_SITE_URL}/bantuan): Pertanyaan umum dan cara menghubungi tim Katamereka`,
    "",
    "## Untuk Pemilik Bisnis",
    "",
    `- [Katamereka Business](${BUSINESS_SITE_URL}/): Kelola profil, balas ulasan, dan pantau analitik reputasi bisnis`,
    `- [Klaim Bisnis](${CONSUMER_SITE_URL}/klaim-bisnis): Cari dan klaim profil bisnis Anda di Katamereka`,
    `- [Informasi untuk Bisnis](${CONSUMER_SITE_URL}/untuk-bisnis): Ringkasan manfaat Katamereka bagi bisnis`,
  ];

  if (categories.length > 0) {
    lines.push("", "## Kategori Bisnis", "");
    for (const c of categories) {
      lines.push(`- [${c.name}](${CONSUMER_SITE_URL}/kategori/${c.slug}): Bisnis kategori ${c.name} beserta ulasan pelanggan`);
    }
  }

  if (cities.length > 0) {
    lines.push("", "## Lokasi", "");
    for (const c of cities) {
      lines.push(`- [Bisnis di ${c.name}](${CONSUMER_SITE_URL}/lokasi/${c.slug}): Bisnis dan ulasan pelanggan di ${c.name}`);
    }
  }

  lines.push(
    "",
    "## Optional",
    "",
    `- [Sitemap](${CONSUMER_SITE_URL}/sitemap.xml): Indeks seluruh halaman publik, termasuk profil bisnis`,
    `- [llms.txt Katamereka Business](${BUSINESS_SITE_URL}/llms.txt): Ringkasan untuk pemilik bisnis`,
    "",
  );

  return lines.join("\n");
}

export async function buildBusinessLlmsTxt(): Promise<string> {
  const activeIndustries = industries.filter((i) => i.status === "ACTIVE");

  const lines: string[] = [
    "# Katamereka Business - Kelola Ulasan & Reputasi Online Bisnis Anda",
    "",
    `> Katamereka Business (${BUSINESS_SITE_URL}) adalah dashboard untuk pemilik bisnis di Indonesia: klaim profil bisnis di Katamereka, balas ulasan pelanggan, dapatkan lencana Terverifikasi, dan pantau analitik reputasi dari satu tempat. Paket bisnis gratis. Platform ulasan untuk konsumen ada di ${CONSUMER_SITE_URL}.`,
    "",
    "## Pertanyaan Populer (FAQ / Quick Knowledge for LLM)",
    "",
    "- **Apa itu Katamereka Business?** Layanan Katamereka untuk pemilik bisnis agar bisa mengelola profil, membalas ulasan, dan memahami pengalaman pelanggan.",
    "- **Berapa harga Katamereka Business?** Gratis untuk memulai, tanpa kartu kredit. Paket Bisnis gratis selamanya mencakup klaim dan kelola profil, balas ulasan tanpa batas, lencana Terverifikasi, dan laporan analitik ulasan mingguan.",
    "- **Berapa lama verifikasi bisnis?** Peninjauan dokumen verifikasi umumnya 1 sampai 2 hari kerja. Setelah disetujui, lencana Terverifikasi muncul di profil bisnis.",
    "- **Bagaimana cara membalas ulasan pelanggan?** Dari dashboard bisnis, buka menu Ulasan lalu pilih Balas pada ulasan yang ingin ditanggapi.",
    "- **Apakah ulasan negatif bisa dihapus?** Tidak untuk ulasan dari pengalaman nyata. Ulasan yang mengandung ujaran kebencian, pencemaran nama baik, atau spam dapat dilaporkan untuk ditinjau tim moderasi.",
    "",
    "## Fitur Utama",
    "",
    "- **Kelola Profil Bisnis**: Lengkapi informasi, jam operasional, kontak, alamat, dan foto agar mudah ditemukan calon pelanggan",
    "- **Pantau & Tanggapi Ulasan**: Balas apresiasi maupun masukan pelanggan atas nama bisnis",
    "- **Analitik & Insight**: Ringkasan ulasan, statistik kepuasan, tren bulanan, dan analisis kata kunci ulasan",
    "- **Kredibilitas**: Lencana Terverifikasi Katamereka untuk bisnis yang lolos verifikasi",
    "",
    "## Halaman Utama",
    "",
    `- [Beranda Katamereka Business](${BUSINESS_SITE_URL}/): Ringkasan layanan untuk pemilik bisnis`,
    `- [Solusi](${BUSINESS_SITE_URL}/solusi): Cara Katamereka membantu membangun reputasi dan mendapat pelanggan baru`,
    `- [Produk](${BUSINESS_SITE_URL}/produk): Dashboard terpadu untuk profil, ulasan, dan analitik`,
    `- [Harga](${BUSINESS_SITE_URL}/harga): Paket Bisnis gratis dan fitur yang termasuk`,
    `- [Tentang Katamereka](${BUSINESS_SITE_URL}/tentang-kami): Visi dan misi Katamereka`,
    `- [Pusat Bantuan](${BUSINESS_SITE_URL}/bantuan): Pertanyaan umum dan kontak tim Katamereka`,
    `- [Klaim Bisnis](${CONSUMER_SITE_URL}/klaim-bisnis): Cari dan klaim profil bisnis Anda`,
  ];

  if (activeIndustries.length > 0) {
    lines.push("", "## Industri yang Dilayani", "");
    for (const ind of activeIndustries) {
      lines.push(`- [${ind.name}](${BUSINESS_SITE_URL}/industri/${slugify(ind.name)}): ${ind.description}`);
    }
  }

  lines.push(
    "",
    "## Optional",
    "",
    `- [Katamereka untuk konsumen](${CONSUMER_SITE_URL}/): Cari bisnis dan baca ulasan pelanggan`,
    `- [Sitemap](${BUSINESS_SITE_URL}/sitemap.xml): Indeks halaman publik Katamereka Business`,
    `- [llms.txt Katamereka](${CONSUMER_SITE_URL}/llms.txt): Ringkasan platform untuk konsumen`,
    "",
  );

  return lines.join("\n");
}
