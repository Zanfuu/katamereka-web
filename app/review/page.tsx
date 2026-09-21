"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function WriteReviewContent() {
  const searchParams = useSearchParams();
  const businessSlug = searchParams.get("business") || "";

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Write Review</h1>
      <p>🚧 Work in Progress</p>
      {businessSlug && (
        <p>Business: {businessSlug}</p>
      )}
      <nav style={{ marginTop: "1rem" }}>
        <ul>
          {businessSlug && (
            <li><Link href={`/business/${businessSlug}`}>← Kembali ke Business</Link></li>
          )}
          <li><Link href={`/review/success${businessSlug ? `?business=${businessSlug}` : ""}`}>Test → Review Success</Link></li>
          <li><Link href="/">← Landing Page</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WriteReviewContent />
    </Suspense>
  );
}
