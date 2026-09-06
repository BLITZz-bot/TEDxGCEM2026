import React from 'react';
import { redirect } from 'next/navigation';
import { checkTeamAdminSession } from '@/lib/team-admin-auth';
import { MemberForm } from '@/components/team/admin/MemberForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Add New Team Member | TEDxGCEM Admin',
  robots: { index: false, follow: false },
};

export default async function NewTeamMemberPage() {
  const isAuth = await checkTeamAdminSession();
  if (!isAuth) {
    redirect('/team/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Add New Team Member
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Create a new crew profile, generate their badge QR code, and assign their visual role theme.
        </p>
      </div>

      <MemberForm />
    </div>
  );
}
