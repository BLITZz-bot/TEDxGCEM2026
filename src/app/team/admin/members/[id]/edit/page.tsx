import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { checkTeamAdminSession } from '@/lib/team-admin-auth';
import { getMemberById } from '@/lib/team-store';
import { MemberForm } from '@/components/team/admin/MemberForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Team Member | TEDxGCEM Admin',
  robots: { index: false, follow: false },
};

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAuth = await checkTeamAdminSession();
  if (!isAuth) {
    redirect('/team/admin/login');
  }

  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Edit Profile: {member.name}
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Update member details, bio, photo, designation, and social links.
        </p>
      </div>

      <MemberForm initialData={member} />
    </div>
  );
}
