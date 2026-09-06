import React from 'react';
import Image from 'next/image';
import Hero3D from '@/components/team/Hero3DWrapper';
import { TeamGrid, GridMember } from '@/components/team/TeamGrid';
import { getAllMembers } from '@/lib/team-store';

export const metadata = {
  title: 'Meet The Team | TEDxGCEM 2026',
  description: 'Meet the people behind the ideas at TEDxGCEM 2026.',
};

export const revalidate = 60;

export default async function TeamPage() {
  const members = await getAllMembers();

  const gridMembers: GridMember[] = members.map((m) => ({
    slug: m.slug,
    name: m.name,
    role: m.role,
    team: m.team,
    oneLiner: m.oneLiner,
    photoUrl: m.photoUrl,
  }));

  return (
    <div className="relative min-h-screen bg-[#06070B] text-slate-100 selection:bg-[#EB0028] selection:text-white overflow-x-hidden">
      {/* 1. Full Viewport WebGL 3D Background */}
      <Hero3D />

      {/* 2. Layer 1: Dark Atmospheric Gradient Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/30 to-[#06070B]/90 backdrop-blur-[1px]" />

      {/* 3. Layer 10: Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between pt-8 sm:pt-12">
        {/* Hero Typography Section */}
        <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 min-h-[calc(100svh-40px)] py-12 sm:py-20 lg:py-28 text-center lg:text-left flex flex-col justify-center">
          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.98] sm:leading-[0.95] break-words">
            Meet The <br className="hidden sm:inline" />
            <span className="text-[#EB0028]">People</span> Behind <br className="hidden sm:inline" />
            The Ideas.
          </h1>

          <p className="mt-6 sm:mt-8 text-lg sm:text-2xl text-gray-300 font-light leading-relaxed self-center lg:self-start flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
            <span>People behind</span>
            <Image
              src="/tedxgcem.png"
              alt="TEDxGCEM"
              width={152}
              height={43}
              priority
              className="inline-block h-[26px] sm:h-[30px] w-auto object-contain align-middle"
            />
          </p>
        </section>

        {/* Team Grid Section */}
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-20">
          <TeamGrid members={gridMembers} />
        </section>

        {/* Global Footer */}
        <footer className="border-t border-white/10 bg-black/80 px-4 sm:px-6 py-8 backdrop-blur-md text-center text-xs text-gray-400">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/tedxgcem.png"
                alt="TEDxGCEM"
                width={133}
                height={38}
                className="h-[25px] w-auto object-contain opacity-80"
              />
              <span className="text-gray-500">— Independent TED event</span>
            </div>
            <p className="text-gray-500 text-[11px] sm:text-xs">
              |||••||
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
