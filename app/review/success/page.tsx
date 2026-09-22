"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ReviewSuccessContent() {
  const searchParams = useSearchParams();
  const businessSlug = searchParams.get("business") || "";

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>✅ Review Success</h1>
      <p>🚧 Work in Progress</p>
      <nav style={{ marginTop: "1rem" }}>
        <ul>
          {businessSlug && (
            <li><Link href={`/business/${businessSlug}`}>← Kembali ke Business</Link></li>
          )}
          <li><Link href="/businesses">List Business</Link></li>
          <li><Link href="/">Landing Page</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default function ReviewSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewSuccessContent />
    </Suspense>
  );
}
