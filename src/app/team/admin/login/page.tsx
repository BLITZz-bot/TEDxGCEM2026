'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TeamAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/team/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid admin credentials. Please try again.');
      } else {
        router.push('/team/admin');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07090E] px-6 py-12 selection:bg-red-500 selection:text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-[#EB0028]/20 blur-[130px]" />

      <div className="relative w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center flex flex-col items-center">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors self-start"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Team Directory
          </Link>

          <Image
            src="/tedxgcem.png"
            alt="TEDxGCEM"
            width={160}
            height={45}
            priority
            className="h-9 w-auto object-contain mb-3"
          />

          <h2 className="text-xl font-bold uppercase tracking-tight text-white">
            Team Administration
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Sign in to manage crew profiles and live badge QR telemetry
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-300 block mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tedxgcem.com"
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] rounded-xl bg-[#EB0028] font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5">
          <p className="text-[11px] text-gray-500 font-mono">
            Default: admin@tedxgcem.com
          </p>
        </div>
      </div>
    </div>
  );
}
