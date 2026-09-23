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
      if ((s === 'vinayaka' || s === 'vinayak') && (clean === 'vinayaka' || clean === 'vinayak' || clean === 'vinayak-v' || clean === 'vinayaka-v')) return true;
      if (s === 'thanishasri' && (clean === 'thanisashri-ss' || clean === 'thanisha' || clean === 'thanishasri-ss' || clean === 'thanisashri')) return true;
      if (s === 'thanisashri-ss' && (clean === 'thanishasri' || clean === 'thanisha')) return true;
      if ((s === 'itz.yez' || s === 'yeshwanth') && (clean === 'yeshwanth' || clean === 'yeswanth' || clean === 'yeshwanth-kg' || clean === 'itz.yez' || clean === 'itz-yez')) return true;
      if (s === 'dr.manoj-challa' && clean === 'dr-manoj-challa') return true;
      return false;
    }) || null
  );
}
