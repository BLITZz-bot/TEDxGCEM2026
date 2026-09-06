'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MemberTable, MemberTableItem } from '@/components/team/admin/MemberTable';
import { ScanChart } from '@/components/team/admin/ScanChart';
import { Plus, Users, QrCode, TrendingUp, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ClientMemberItem extends MemberTableItem {
  scans: { scannedAt: string; source?: string | null }[];
}

interface AdminDashboardClientProps {
  members: ClientMemberItem[];
  allScans: { scannedAt: string; source?: string | null }[];
}

export function AdminDashboardClient({ members, allScans }: AdminDashboardClientProps) {
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<ClientMemberItem | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const activeScans = selectedMember ? selectedMember.scans : allScans;

  const totalMembers = members.length;
  const totalScans = members.reduce((acc, m) => acc + (m.scanCount || 0), 0);
  const sortedByScans = [...members].sort((a, b) => b.scanCount - a.scanCount);
  const topMember = sortedByScans[0];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/team/admin/logout', { method: 'POST' });
      router.push('/team/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Team & Badge Analytics
            </h1>
            <span className="rounded-full border border-red-500/30 bg-red-950/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-400">
              Admin
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time ID card QR scan telemetry and team directory management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/team/admin/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#EB0028] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Members
            </span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-3 text-3xl font-black text-white">{totalMembers}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">Active event crew</span>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Badge Scans
            </span>
            <QrCode className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-3 text-3xl font-black text-[#EB0028]">{totalScans}</div>
          <span className="text-[11px] text-gray-500 mt-1 block">QR code interactions</span>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Top Scanned Member
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-xl font-bold text-white truncate">
            {topMember ? topMember.name : 'None yet'}
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">
            {topMember ? `${topMember.scanCount} scans (${topMember.role})` : 'Awaiting first scan'}
          </span>
        </div>
      </div>

      {/* Scan Chart Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
            {selectedMember ? `Filtered Member Chart: ${selectedMember.name}` : 'Overall Scan Activity (All Members)'}
          </span>

          {selectedMember && (
            <button
              onClick={() => setSelectedMember(null)}
              className="text-xs text-red-400 hover:underline"
            >
              Reset to All Scans
            </button>
          )}
        </div>
        <ScanChart scans={activeScans} memberName={selectedMember?.name} />
      </div>

      {/* Member Table Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Team Directory Administration</h2>
        <MemberTable
          members={members}
          onSelectMemberForChart={(m) => setSelectedMember(m as ClientMemberItem)}
        />
      </div>
    </div>
  );
}
