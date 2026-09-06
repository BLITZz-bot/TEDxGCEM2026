import { INITIAL_MEMBERS, StaticMember } from './members-data';

export type MemberWithScans = StaticMember & {
  interests: string;
};

export async function getAllMembers(): Promise<StaticMember[]> {
  return INITIAL_MEMBERS;
}

export async function getMemberBySlug(slug: string): Promise<StaticMember | null> {
  return INITIAL_MEMBERS.find((m) => m.slug.toLowerCase() === slug.toLowerCase()) || null;
}
