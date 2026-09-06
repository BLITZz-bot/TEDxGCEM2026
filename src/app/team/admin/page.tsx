import React from 'react';
import { redirect } from 'next/navigation';
import { checkTeamAdminSession } from '@/lib/team-admin-auth';
import { getAllMembers, getAllScans } from '@/lib/team-store';
import { AdminDashboardClient, ClientMemberItem } from '@/components/team/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Team & Scan Analytics Admin | TEDxGCEM',
  robots: { index: false, follow: false },
};

export default async function TeamAdminPage() {
  const isAuth = await checkTeamAdminSession();
  if (!isAuth) {
    redirect('/team/admin/login');
  }

  const [rawMembers, rawScans] = await Promise.all([getAllMembers(), getAllScans()]);

  // Map Prisma Member → ClientMemberItem (dates → ISO strings)
  const members: ClientMemberItem[] = rawMembers.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    role: m.role,
    team: m.team,
    photoUrl: m.photoUrl,
    scanCount: m.scanCount,
    updatedAt: m.updatedAt.toISOString(),
    scans: m.scans.map((s) => ({
      scannedAt: s.scannedAt instanceof Date ? s.scannedAt.toISOString() : String(s.scannedAt),
      source: s.source ?? null,
    })),
  }));

  const allScans = rawScans.map((s) => ({
    scannedAt: s.scannedAt instanceof Date ? s.scannedAt.toISOString() : String(s.scannedAt),
    source: s.source ?? null,
  }));

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-[#EB0028] selection:text-white">
      <AdminDashboardClient members={members} allScans={allScans} />
    </div>
  );
}
