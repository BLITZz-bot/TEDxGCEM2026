'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Sparkles, Download } from 'lucide-react';
import { teamThemes, TeamGroup } from '@/lib/themes';

interface InitialMemberData {
  id?: string;
  slug?: string;
  name: string;
  role: string;
  team: string;
  oneLiner: string;
  bio: string;
  contribution: string;
  interests: string;
  photoUrl: string;
  linkedin?: string | null;
  instagram?: string | null;
  github?: string | null;
  portfolio?: string | null;
  email?: string | null;
}

export function MemberForm({ initialData }: { initialData?: InitialMemberData }) {
  const router = useRouter();
  const isEdit = Boolean(initialData?.id);

  let parsedInterestsString = '';
  try {
    if (initialData?.interests) {
      const arr = JSON.parse(initialData.interests);
      if (Array.isArray(arr)) {
        parsedInterestsString = arr.join(', ');
      }
    }
  } catch {
    parsedInterestsString = '';
  }

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    role: initialData?.role || '',
    team: (initialData?.team || 'technology') as TeamGroup,
    oneLiner: initialData?.oneLiner || '',
    bio: initialData?.bio || '',
    contribution: initialData?.contribution || '',
    interestsInput: parsedInterestsString,
    photoUrl: initialData?.photoUrl || '/members/placeholder.png',
    linkedin: initialData?.linkedin || '',
    instagram: initialData?.instagram || '',
    github: initialData?.github || '',
    portfolio: initialData?.portfolio || '',
    email: initialData?.email || '',
  });

  const [previewError, setPreviewError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const interestsArr = formData.interestsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      interests: JSON.stringify(interestsArr),
    };

    try {
      const url = isEdit ? `/api/team/admin/members/${initialData?.id}` : '/api/team/admin/members';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/team/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save member details');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const teamKeys = Object.keys(teamThemes) as TeamGroup[];
  const previewSrc = previewError ? '/members/placeholder.png' : formData.photoUrl || '/members/placeholder.png';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full px-4 py-8">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Cancel</span>
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isEdit && initialData?.slug && (
            <a
              href={`/api/team/admin/qr/${initialData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download QR</span>
            </a>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#EB0028] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isEdit ? 'Save Profile' : 'Create Profile'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Col: Photo & Theme Preview */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-4">
              Profile Photo Preview
            </h3>
            <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-inner">
              <Image
                src={previewSrc}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => setPreviewError(true)}
              />
            </div>

            <div className="mt-4">
              <label className="text-xs text-gray-400 block mb-1 font-medium">Photo URL / Path</label>
              <input
                type="text"
                value={formData.photoUrl}
                onChange={(e) => {
                  setPreviewError(false);
                  setFormData({ ...formData, photoUrl: e.target.value });
                }}
                placeholder="/members/name.png or https://..."
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Fields */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-2xl space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold border-b border-white/10 pb-3">
              Core Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bharath M"
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1 font-medium">Official Designation *</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Executive Producer"
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-medium">Team Group (Color Theme) *</label>
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value as TeamGroup })}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
              >
                {teamKeys.map((key) => (
                  <option key={key} value={key}>
                    {teamThemes[key].name} ({key})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-medium">One-Liner Hook *</label>
              <input
                type="text"
                required
                value={formData.oneLiner}
                onChange={(e) => setFormData({ ...formData, oneLiner: e.target.value })}
                placeholder="Punchy one sentence description"
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-medium">Biography</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Detailed biography..."
                className="w-full rounded-xl border border-white/15 bg-white/5 p-3.5 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-medium">TEDxGCEM 2026 Contribution</label>
              <textarea
                rows={2}
                value={formData.contribution}
                onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                placeholder="What did they build or direct for this conference?"
                className="w-full rounded-xl border border-white/15 bg-white/5 p-3.5 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-medium">
                Interests & Keywords (comma separated)
              </label>
              <input
                type="text"
                value={formData.interestsInput}
                onChange={(e) => setFormData({ ...formData, interestsInput: e.target.value })}
                placeholder="Event Strategy, Production, UI/UX"
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-2xl space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold border-b border-white/10 pb-3">
              Social Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-medium">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1 font-medium">Instagram URL</label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1 font-medium">GitHub URL</label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
