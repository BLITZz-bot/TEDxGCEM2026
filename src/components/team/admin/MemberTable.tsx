'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, QrCode, Search, TrendingUp, ExternalLink } from 'lucide-react';
import { getTeamTheme } from '@/lib/themes';

export interface MemberTableItem {
  id: string;
  slug: string;
  name: string;
  role: string;
  team: string;
  photoUrl: string;
  scanCount: number;
  updatedAt: string;
}

interface MemberTableProps {
  members: MemberTableItem[];
  onSelectMemberForChart?: (member: MemberTableItem) => void;
}

export function MemberTable({ members, onSelectMemberForChart }: MemberTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [qrModalSlug, setQrModalSlug] = useState<string | null>(null);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === 'all' || m.team.toLowerCase() === teamFilter.toLowerCase();
    return matchesSearch && matchesTeam;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/team/admin/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete member');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during deletion');
    } finally {
      setDeletingId(null);
    }
  };

  const teams = Array.from(new Set(members.map((m) => m.team)));

  return (
    <div className="space-y-4 w-full">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-md pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full sm:w-auto min-h-[44px] rounded-xl border border-white/15 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 text-sm text-gray-300 focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Mobile Cards View (< 768px) */}
      <div className="grid gap-4 grid-cols-1 md:hidden w-full">
        {filteredMembers.map((member) => {
          const theme = getTeamTheme(member.team);
          return (
            <div
              key={member.id}
              className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 backdrop-blur-xl shadow-md space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/15 flex-shrink-0">
                  <Image
                    src={member.photoUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/team/${member.slug}`}
                    target="_blank"
                    className="font-bold text-base text-white hover:text-red-400 flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{member.name}</span>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                  </Link>

                  <span className="text-xs text-gray-400 block truncate">{member.role}</span>

                  <div className="mt-1">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${theme.badgeStyle}`}
                    >
                      {member.team}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <button
                  onClick={() => onSelectMemberForChart?.(member)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-red-500/20 bg-red-950/40 px-3 py-1 text-xs font-bold text-red-400"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{member.scanCount} Scans</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQrModalSlug(member.slug)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-red-400"
                    aria-label="View QR Badge Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>

                  <Link
                    href={`/team/admin/members/${member.id}/edit`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-blue-400"
                    aria-label="Edit Profile"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    disabled={deletingId === member.id}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-red-500 disabled:opacity-50"
                    aria-label="Delete Profile"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMembers.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500 rounded-2xl border border-white/10 bg-white/[0.04]">
            No team members matching filter.
          </div>
        )}
      </div>

      {/* 2. Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="border-b border-white/10 bg-black/40 text-xs uppercase text-gray-400 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Team</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">QR Scans</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMembers.map((member) => {
              const theme = getTeamTheme(member.team);
              return (
                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                  {/* Photo & Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/15 shadow-inner flex-shrink-0">
                        <Image
                          src={member.photoUrl}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/team/${member.slug}`}
                          target="_blank"
                          className="font-semibold text-white hover:text-red-400 flex items-center gap-1 group"
                        >
                          {member.name}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <span className="text-xs text-gray-500 block">/team/{member.slug}</span>
                      </div>
                    </div>
                  </td>

                  {/* Team Badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase backdrop-blur-md ${theme.badgeStyle}`}
                    >
                      {member.team}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 font-medium text-gray-200">{member.role}</td>

                  {/* Scans Count */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onSelectMemberForChart?.(member)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-950/30 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-900/50 transition-colors backdrop-blur-md"
                      title="Click to view detailed scan chart"
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{member.scanCount}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setQrModalSlug(member.slug)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        aria-label="Download QR Badge Code"
                        title="View & Download QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>

                      <Link
                        href={`/team/admin/members/${member.id}/edit`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                        aria-label="Edit Profile"
                        title="Edit Member Profile"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        disabled={deletingId === member.id}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-500 transition-colors disabled:opacity-50"
                        aria-label="Delete Profile"
                        title="Delete Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No team members matching filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* QR Code Modal */}
      {qrModalSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-slate-900/95 p-6 shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">
              Badge QR Code
            </h3>
            <p className="text-xs text-gray-400">
              Scans directly to <span className="text-red-400 font-mono">/team/{qrModalSlug}</span>
            </p>

            <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl bg-white p-3 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/team/admin/qr/${qrModalSlug}`}
                alt="QR Code"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex gap-2">
              <a
                href={`/api/team/admin/qr/${qrModalSlug}`}
                download={`tedx-qr-${qrModalSlug}.png`}
                className="flex-1 rounded-xl bg-[#EB0028] py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors"
              >
                Download PNG
              </a>
              <a
                href={`/api/team/admin/qr/${qrModalSlug}?format=svg`}
                download={`tedx-qr-${qrModalSlug}.svg`}
                className="flex-1 rounded-xl border border-white/20 bg-white/5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
              >
                Download SVG
              </a>
            </div>

            <button
              onClick={() => setQrModalSlug(null)}
              className="w-full text-xs text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
