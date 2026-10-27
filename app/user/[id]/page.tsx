import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicUserProfile } from "@/lib/api-profile";
import UserProfileClient from "./user-profile-client";

export const revalidate = 60; // ISR cache 60s

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchPublicUserProfile(id);

  if (!profile) {
    return {
      title: "Profil Pengguna Tidak Ditemukan - Katamereka",
      description: "Profil reviewer tidak ditemukan di Katamereka.",
    };
  }

  const name = profile.user.name;
  const total = profile.stats.total_reviews;

  return {
    title: `Ulasan & Rating oleh ${name} - Komunitas Katamereka`,
    description: `Lihat ${total} ulasan bisnis, rekomendasi, dan pengalaman nyata yang dibagikan oleh ${name} di Katamereka.`,
    openGraph: {
      title: `Ulasan & Rating oleh ${name} - Katamereka`,
      description: `Lihat riwayat ulasan bisnis dan foto dari ${name} di platform rekomendasi bisnis terpercaya Katamereka.`,
    },
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await fetchPublicUserProfile(id);

  if (!profile) {
    notFound();
  }

  return <UserProfileClient profile={profile} />;
}
