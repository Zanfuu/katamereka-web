"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getBusinessBySlug } from "@/lib/mock-data";

export default function BusinessReviewsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const business = getBusinessBySlug(slug);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>All Reviews: {business?.name || slug}</h1>
      <p>🚧 Work in Progress</p>
      <Link href={`/business/${slug}`}>← Kembali ke {business?.name || slug}</Link>
    </div>
  );
}
