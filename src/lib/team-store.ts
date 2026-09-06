/**
 * team-store.ts — Prisma-backed data layer for team members and scan events.
 * All functions are async and query Neon PostgreSQL via @prisma/client.
 * This replaces the previous in-memory global store.
 */

import { prisma } from './prisma';
import { INITIAL_MEMBERS } from './members-data';
import type { Member, ScanEvent } from '@prisma/client';

export type { Member, ScanEvent };

// ─── Types ────────────────────────────────────────────────────────────────────

export type MemberWithScans = Member & {
  scans: Pick<ScanEvent, 'scannedAt' | 'source'>[];
  _count?: { scans: number };
};

function staticToMemberWithScans(m: (typeof INITIAL_MEMBERS)[number]): MemberWithScans {
  return {
    id: m.slug,
    slug: m.slug,
    name: m.name,
    role: m.role,
    team: m.team as import('@prisma/client').Team,
    oneLiner: m.oneLiner,
    bio: m.bio,
    contribution: m.contribution,
    interests: JSON.stringify(m.interests),
    photoUrl: m.photoUrl,
    linkedin: m.linkedin || null,
    instagram: m.instagram || null,
    github: m.github || null,
    portfolio: m.portfolio || null,
    email: m.email || null,
    scanCount: m.scanCount || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    scans: [],
    _count: { scans: m.scanCount || 0 },
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getAllMembers(): Promise<MemberWithScans[]> {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        scans: {
          orderBy: { scannedAt: 'desc' },
          take: 50,
          select: { scannedAt: true, source: true },
        },
        _count: { select: { scans: true } },
      },
    });

    const slugOrder = new Map(INITIAL_MEMBERS.map((m, idx) => [m.slug.toLowerCase(), idx]));
    return members.sort((a, b) => {
      const orderA = slugOrder.has(a.slug.toLowerCase()) ? slugOrder.get(a.slug.toLowerCase())! : 999;
      const orderB = slugOrder.has(b.slug.toLowerCase()) ? slugOrder.get(b.slug.toLowerCase())! : 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  } catch (err) {
    console.warn('⚠️  Prisma getAllMembers fallback to INITIAL_MEMBERS:', err);
    return INITIAL_MEMBERS.map(staticToMemberWithScans);
  }
}

export async function getMemberBySlug(slug: string): Promise<MemberWithScans | null> {
  try {
    return await prisma.member.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        scans: {
          orderBy: { scannedAt: 'desc' },
          take: 20,
          select: { scannedAt: true, source: true },
        },
        _count: { select: { scans: true } },
      },
    });
  } catch (err) {
    console.warn('⚠️  Prisma getMemberBySlug fallback to INITIAL_MEMBERS for slug:', slug, err);
    const m = INITIAL_MEMBERS.find((mem) => mem.slug.toLowerCase() === slug.toLowerCase());
    return m ? staticToMemberWithScans(m) : null;
  }
}

export async function getMemberById(id: string): Promise<MemberWithScans | null> {
  try {
    return await prisma.member.findUnique({
      where: { id },
      include: {
        scans: {
          orderBy: { scannedAt: 'desc' },
          take: 20,
          select: { scannedAt: true, source: true },
        },
        _count: { select: { scans: true } },
      },
    });
  } catch (err) {
    console.warn('⚠️  Prisma getMemberById fallback to INITIAL_MEMBERS for id:', id, err);
    const m = INITIAL_MEMBERS.find((mem) => mem.slug === id);
    return m ? staticToMemberWithScans(m) : null;
  }
}

// ─── Scan Tracking ────────────────────────────────────────────────────────────

const recentScansMap = new Map<string, number>();

export async function recordScan(
  slug: string,
  source: string = 'qr'
): Promise<{ recorded: boolean; debounced: boolean }> {
  // 10-second debounce per slug (same as original)
  const now = Date.now();
  const last = recentScansMap.get(slug);
  if (last && now - last < 10_000) {
    return { recorded: false, debounced: true };
  }
  recentScansMap.set(slug, now);

  // Cleanup old entries
  if (recentScansMap.size > 100) {
    for (const [k, v] of recentScansMap.entries()) {
      if (now - v > 60_000) recentScansMap.delete(k);
    }
  }

  const member = await prisma.member.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true },
  });

  if (!member) return { recorded: false, debounced: false };

  await prisma.$transaction([
    prisma.member.update({
      where: { id: member.id },
      data: { scanCount: { increment: 1 } },
    }),
    prisma.scanEvent.create({
      data: { memberId: member.id, source },
    }),
  ]);

  return { recorded: true, debounced: false };
}

export async function getAllScans(): Promise<(ScanEvent & { member: Pick<Member, 'slug' | 'name'> })[]> {
  return prisma.scanEvent.findMany({
    orderBy: { scannedAt: 'desc' },
    take: 200,
    include: {
      member: { select: { slug: true, name: true } },
    },
  });
}

// ─── CRUD (Admin) ─────────────────────────────────────────────────────────────

export async function createMember(data: {
  slug?: string;
  name: string;
  role: string;
  team: string;
  oneLiner: string;
  bio: string;
  contribution: string;
  interests: string | string[];
  photoUrl: string;
  linkedin?: string | null;
  instagram?: string | null;
  github?: string | null;
  portfolio?: string | null;
  email?: string | null;
}): Promise<Member> {
  // Auto-generate slug if not provided
  let slug =
    data.slug ||
    data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

  // Ensure unique slug
  let counter = 1;
  while (await prisma.member.findUnique({ where: { slug } })) {
    slug = `${slug}-${counter++}`;
  }

  const interestsStr =
    typeof data.interests === 'string' ? data.interests : JSON.stringify(data.interests ?? []);

  return prisma.member.create({
    data: {
      slug,
      name: data.name,
      role: data.role,
      team: data.team as import('@prisma/client').Team,
      oneLiner: data.oneLiner,
      bio: data.bio,
      contribution: data.contribution,
      interests: interestsStr,
      photoUrl: data.photoUrl || '/members/placeholder.png',
      linkedin: data.linkedin || null,
      instagram: data.instagram || null,
      github: data.github || null,
      portfolio: data.portfolio || null,
      email: data.email || null,
    },
  });
}

export async function updateMember(
  id: string,
  data: Partial<{
    name: string;
    role: string;
    team: string;
    oneLiner: string;
    bio: string;
    contribution: string;
    interests: string | string[];
    photoUrl: string;
    linkedin: string | null;
    instagram: string | null;
    github: string | null;
    portfolio: string | null;
    email: string | null;
  }>
): Promise<Member | null> {
  const interestsStr =
    data.interests !== undefined
      ? typeof data.interests === 'string'
        ? data.interests
        : JSON.stringify(data.interests)
      : undefined;

  try {
    return await prisma.member.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.team !== undefined ? { team: data.team as import('@prisma/client').Team } : {}),
        ...(data.oneLiner !== undefined ? { oneLiner: data.oneLiner } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.contribution !== undefined ? { contribution: data.contribution } : {}),
        ...(interestsStr !== undefined ? { interests: interestsStr } : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
        ...(data.linkedin !== undefined ? { linkedin: data.linkedin } : {}),
        ...(data.instagram !== undefined ? { instagram: data.instagram } : {}),
        ...(data.github !== undefined ? { github: data.github } : {}),
        ...(data.portfolio !== undefined ? { portfolio: data.portfolio } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
      },
    });
  } catch {
    return null;
  }
}

export async function deleteMember(id: string): Promise<boolean> {
  try {
    await prisma.member.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
