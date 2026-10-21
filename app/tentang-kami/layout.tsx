import type { Metadata } from "next";
import { getRequestHost } from "@/lib/request-host";
import { siteUrlForHost } from "@/lib/site-config";

// Reachable from both katamereka.id and business.katamereka.id (same
// content, shared route) — canonical must follow whichever host served
// the request, not always the consumer domain.
export async function generateMetadata(): Promise<Metadata> {
  const host = await getRequestHost();
  const siteUrl = siteUrlForHost(host);
  return {
    title: "Tentang Katamereka — Platform Ulasan Bisnis Indonesia",
    description:
      "Kenali Katamereka: platform ulasan bisnis yang membantu pelanggan memilih berdasarkan pengalaman nyata dan membantu bisnis membangun kepercayaan.",
    alternates: {
      canonical: `${siteUrl}/tentang-kami`,
    },
    openGraph: {
      title: "Tentang Katamereka — Platform Ulasan Bisnis Indonesia",
      description:
        "Kenali Katamereka: platform ulasan bisnis yang membantu pelanggan memilih berdasarkan pengalaman nyata dan membantu bisnis membangun kepercayaan.",
      url: `${siteUrl}/tentang-kami`,
      siteName: "Katamereka",
      locale: "id_ID",
      type: "website",
      images: [{ url: `${siteUrl}/logo.png` }],
    },
  };
}

export default function TentangKamiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
