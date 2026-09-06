import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProfileTemplate, MemberData } from '@/components/team/ProfileTemplate';
import { getMemberBySlug } from '@/lib/team-store';
import { INITIAL_MEMBERS } from '@/lib/members-data';

export const revalidate = 60;

// Pre-render all known member slugs at build time for instant QR scan loading
export async function generateStaticParams() {
  return INITIAL_MEMBERS.map((m) => ({
    slug: m.slug,
  }));
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

  const memberData: MemberData = {
    id: member.id,
    slug: member.slug,
    name: member.name,
    role: member.role,
    team: member.team,
    oneLiner: member.oneLiner,
    bio: member.bio,
    contribution: member.contribution,
    interests: member.interests,
    photoUrl: member.photoUrl,
    linkedin: member.linkedin,
    instagram: member.instagram,
    github: member.github,
    portfolio: member.portfolio,
    email: member.email,
    scanCount: member.scanCount,
  };

  return (
    <Suspense fallback={null}>
      <ProfileTemplate member={memberData} />
    </Suspense>
  );
}
