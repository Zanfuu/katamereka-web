import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin } from "lucide-react";
import Navbar from "@/components/navbar";
import { slugify } from "@/lib/slug";
import { fetchBusinesses, fetchCityFacets, ApiCityFacet } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import { JsonLd } from "@/lib/json-ld";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/schema-org";
import { buildPageMetadata } from "@/lib/seo-metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ISR: city listings are rendered once and re-used for 5 minutes.
export const revalidate = 300;

// Opts the dynamic route into ISR (render on first hit, then cache).
export async function generateStaticParams() {
  return [];
}

async function findCity(slug: string): Promise<ApiCityFacet | null> {
  const facets = await fetchCityFacets();
  // fetchCityFacets() returns [] when the API is unreachable. Throwing (instead
  // of falling through to notFound()) stops ISR from caching a 404 for a real
  // city during an outage — the last good page keeps being served.
  if (facets.length === 0) throw new Error("City facets unavailable");
  return facets.find((c) => slugify(c.city) === slug) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = await findCity(slug);
  if (!city) return {};

  return buildPageMetadata({
    title: `Bisnis Terpercaya di ${city.city} — Ulasan Pelanggan | Katamereka`,
    description: `Temukan bisnis dan layanan terpercaya di ${city.city} berdasarkan ulasan nyata pelanggan di Katamereka.`,
    url: `${CONSUMER_SITE_URL}/lokasi/${slug}`,
  });
}

export default async function LokasiPage({ params }: PageProps) {
  const { slug } = await params;
  const city = await findCity(slug);
  if (!city) notFound();

  const { data: businesses } = await fetchBusinesses({ city: city.city, limit: 24 });

  const cityUrl = `${CONSUMER_SITE_URL}/lokasi/${slug}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Beranda", url: `${CONSUMER_SITE_URL}/` },
            { name: city.city, url: cityUrl },
          ]),
          buildItemListSchema(
            `Bisnis Terpercaya di ${city.city}`,
            businesses.map((b) => ({
              name: b.name,
              url: `${CONSUMER_SITE_URL}/business/${b.slug}`,
            }))
          ),
        ]}
      />
      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#e8f6f2] via-[#f4faf7] to-white pt-10 pb-10 border-b border-emerald-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#008767]">Home</Link>
              <span className="mx-1.5">/</span>
              <Link href="/businesses" className="hover:text-[#008767]">Lokasi</Link>
              <span className="mx-1.5">/</span>
              <span className="text-slate-700 font-semibold">{city.city}</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Bisnis Terpercaya di {city.city}
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              {city.count} bisnis di {city.city} sudah punya ulasan di Katamereka.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {businesses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center text-sm text-slate-500">
              Belum ada bisnis terdaftar di {city.city}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {businesses.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/business/${biz.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:border-[#008767]/40 transition-all space-y-2"
                >
                  <h2 className="font-bold text-slate-900 text-sm group-hover:text-[#008767]">{biz.name}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {biz.address}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{biz.rating}</span>
                    <span className="text-slate-400 font-normal">({biz.reviews_count} ulasan)</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
