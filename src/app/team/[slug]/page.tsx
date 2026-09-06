import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProfileTemplate, MemberData } from '@/components/team/ProfileTemplate';
import { INITIAL_MEMBERS } from '@/lib/members-data';

export const revalidate = 60;

// Pre-render all known member slugs at build time for instant loading when scanning QR codes
export async function generateStaticParams() {
  return INITIAL_MEMBERS.map((m) => ({
    slug: m.slug,
  }));
}

async function getMemberBySlug(slug: string): Promise<MemberData | null> {
  const fallback = INITIAL_MEMBERS.find((m) => m.slug.toLowerCase() === slug.toLowerCase());
  if (fallback) {
    return {
      id: fallback.id || fallback.slug,
      slug: fallback.slug,
      name: fallback.name,
      role: fallback.role,
      team: fallback.team,
      oneLiner: fallback.oneLiner,
      bio: fallback.bio,
      contribution: fallback.contribution,
      interests: JSON.stringify(fallback.interests),
      photoUrl: fallback.photoUrl,
      linkedin: fallback.linkedin || null,
      instagram: fallback.instagram || null,
      github: fallback.github || null,
      portfolio: fallback.portfolio || null,
      email: fallback.email || null,
      scanCount: fallback.scanCount ?? 0,
    };
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await getMemberBySlug(slug);

  if (!member) {
    return { title: 'Member Not Found | TEDxGCEM' };
  }

  return {
    title: `${member.name} — ${member.role} | TEDxGCEM Team`,
    description: member.oneLiner,
    openGraph: {
      title: `${member.name} — ${member.role}`,
      description: member.oneLiner,
      images: [member.photoUrl],
    },
  };
}

export default async function MemberProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await getMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <ProfileTemplate member={member} />
    </Suspense>
  );
}
