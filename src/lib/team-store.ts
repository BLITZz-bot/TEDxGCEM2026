import { INITIAL_MEMBERS, StaticMember } from './members-data';

export type MemberWithScans = StaticMember & {
  interests: string;
};

export async function getAllMembers(): Promise<StaticMember[]> {
  return INITIAL_MEMBERS;
}

export async function getMemberBySlug(slug: string): Promise<StaticMember | null> {
  const clean = slug.toLowerCase().trim();
  return (
    INITIAL_MEMBERS.find((m) => {
      const s = m.slug.toLowerCase();
      if (s === clean) return true;
      if (s === 'vinayaka' && (clean === 'vinayak' || clean === 'vinayak-v')) return true;
      if (s === 'vinayak' && clean === 'vinayaka') return true;
      return false;
    }) || null
  );
}
