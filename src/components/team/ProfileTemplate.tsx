'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { ThemeProvider } from '@/components/team/ThemeProvider';
import { getTeamTheme } from '@/lib/themes';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface MemberData {
  id?: string;
  slug: string;
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
  discord?: string | null;
  twitter?: string | null;
  scanCount?: number;
}

const FALLBACK_PHOTO = '/members/placeholder.png';

function getValidPhotoUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return FALLBACK_PHOTO;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  return FALLBACK_PHOTO;
}

// Split full name intelligently for editorial typography
function formatName(name: string): { first: string; rest: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], rest: '' };
  }
  return {
    first: parts[0],
    rest: parts.slice(1).join(' '),
  };
}

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.6 1.6 0 1 0 1.6 1.6c0-.88-.72-1.6-1.6-1.6Z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export function ProfileTemplate({ member }: { member: MemberData }) {
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get('src') || 'direct-link';
  const theme = getTeamTheme(member.team);

  const [imageSrc, setImageSrc] = useState(() => getValidPhotoUrl(member.photoUrl));
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const isBharath = member.slug === 'bharatha01' || member.slug === 'bharath-m';

  const nameFormatted = React.useMemo(() => {
    return formatName(member.name);
  }, [member.name]);

  let parsedInterests: string[] = [];
  try {
    if (member.interests) {
      parsedInterests = JSON.parse(member.interests);
    }
  } catch {
    parsedInterests = [];
  }

  // GSAP subtle parallax effect on member portrait
  useEffect(() => {
    if (!photoContainerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(photoContainerRef.current, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: photoContainerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const socialLinks = React.useMemo(() => {
    const links: { name: string; url: string; icon: React.ComponentType<{ className?: string }> }[] = [];

    if (member.linkedin) {
      links.push({ name: 'LinkedIn', url: member.linkedin, icon: LinkedinIcon });
    }
    if (member.instagram) {
      links.push({ name: 'Instagram', url: member.instagram, icon: InstagramIcon });
    }
    if (member.github) {
      links.push({ name: 'GitHub', url: member.github, icon: GithubIcon });
    }
    if (member.portfolio) {
      links.push({ name: 'Portfolio', url: member.portfolio, icon: GlobeIcon });
    }
    if (member.twitter) {
      links.push({ name: 'X (Twitter)', url: member.twitter, icon: XIcon });
    }
    if (member.discord) {
      links.push({ name: 'Discord', url: member.discord, icon: DiscordIcon });
    }
    if (member.email) {
      links.push({ name: 'Email', url: `mailto:${member.email}`, icon: MailIcon });
    }

    return links;
  }, [member]);

  return (
    <ThemeProvider team={member.team}>
      <div className="relative min-h-screen bg-[#07070A] text-neutral-100 selection:bg-[#EB0028] selection:text-white bg-grain bg-architectural-grid font-sans-editorial overflow-x-hidden">

        {/* Subtle Atmospheric Glow */}
        <div
          className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 h-[700px] w-[90vw] max-w-[1200px] rounded-full blur-[160px] opacity-15 z-0"
          style={{ backgroundColor: theme.accentColor }}
        />

        {/* Minimal Luxury Header */}
        <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference bg-black/40 backdrop-blur-md border-b border-white/5 px-6 sm:px-12 py-5 flex items-center justify-between">
          <Link href="/" className="group flex items-center">
            <Image
              src="/tedxgcem.png"
              alt="TEDxGCEM Logo"
              width={152}
              height={43}
              priority
              className="h-7 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90"
            />
          </Link>

          <Link
            href="/"
            className="group flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>BACK TO TEAM</span>
          </Link>
        </header>

        {/* SECTION 1: HERO — CINEMATIC FULL-SCREEN INTRODUCTION */}
        <section ref={heroRef} className="relative min-h-screen pt-28 pb-16 sm:pt-36 sm:pb-24 px-6 sm:px-12 lg:px-20 flex flex-col justify-between z-10">
          {/* Micro Top Details */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-8 text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-400">
            <div className="flex items-center gap-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
              <span>TEDxGCEM / 2026 EDITION</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline" style={{ color: theme.accentColor }}>
                TEAM: {member.team.toUpperCase()}
              </span>
              <span>01 / 03</span>
            </div>
          </div>

          {/* Asymmetrical Editorial Composition */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end my-auto">
            {/* Left Column: Name & Metadata */}
            <div className="lg:col-span-7 flex flex-col justify-end order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Role Pill */}
                <div className="inline-flex items-center gap-2 mb-6 border border-white/15 px-3.5 py-1.5 rounded-full bg-white/[0.03]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                  <span className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-300">
                    {member.role}
                  </span>
                </div>

                {/* Oversized Name Typography */}
                {isBharath ? (
                  <h1 className="font-serif-editorial font-medium uppercase tracking-tight text-white leading-tight text-[clamp(2.2rem,5.6vw,6.5rem)] whitespace-nowrap drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]">
                    {member.name}
                  </h1>
                ) : (
                  <h1 className="font-serif-editorial font-light uppercase tracking-tight text-white leading-[0.88] text-[clamp(3.2rem,8.5vw,9.5rem)] text-balance">
                    <span className="block font-normal">{nameFormatted.first}</span>
                    {nameFormatted.rest && (
                      <span className="block text-neutral-400 font-extralight italic">
                        {nameFormatted.rest}
                      </span>
                    )}
                  </h1>
                )}

                {/* Sub-line meta */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-widest text-neutral-400 uppercase">
                  <span>  </span>
                  <span className="text-neutral-500">  TEDxGCEM TEAM ARCHIVE</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Editorial Portrait Frame */}
            <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-[420px] aspect-[3/4]"
              >
                {/* Outer offset hairline box */}
                <div className="absolute -inset-3 border border-white/10 rounded-sm pointer-events-none" />

                {/* Main Photo Frame */}
                <div
                  ref={photoContainerRef}
                  className="relative w-full h-full overflow-hidden rounded-sm border border-white/15 shadow-2xl bg-neutral-900 group"
                >
                  <Image
                    src={imageSrc}
                    alt={member.name}
                    fill
                    priority
                    onError={() => setImageSrc(FALLBACK_PHOTO)}
                    sizes="(max-width: 768px) 95vw, 40vw"
                    className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Corner Accent Badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-white/80">
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/10">
                      {member.team}
                    </span>
                    <span className="text-[#EB0028]">● 2026</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="pt-12 flex items-center justify-between text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 border-t border-white/10">
            <span>SCROLL TO DISCOVER</span>
            <div className="w-12 h-px bg-white/20" />
          </div>
        </section>

        {/* SECTION 2: EDITORIAL QUOTE / ONE-LINER */}
        {member.oneLiner && (
          <section className="relative py-24 sm:py-32 px-6 sm:px-12 lg:px-20 border-t border-white/10 z-10">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative text-center sm:text-left"
              >
                <span
                  className="block font-serif-editorial text-7xl sm:text-9xl leading-none select-none opacity-20 mb-[-2rem]"
                  style={{ color: theme.accentColor }}
                >
                  “
                </span>
                <h2 className="font-serif-editorial text-2xl sm:text-4xl md:text-5xl font-light text-neutral-100 leading-tight tracking-wide italic">
                  {member.oneLiner}
                </h2>
                <div className="mt-8 flex items-center gap-4 sm:justify-start justify-center">
                  <div className="w-10 h-px" style={{ backgroundColor: theme.accentColor }} />
                  <span className="text-xs font-mono tracking-[0.25em] uppercase text-neutral-400">
                    PERSPECTIVE
                  </span>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* SECTION 3: ABOUT (BIOGRAPHY) */}
        <section className="relative py-24 sm:py-32 px-6 sm:px-12 lg:px-20 border-t border-white/10 z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 sm:gap-16">
            {/* Left Header Column */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="sticky top-28"
              >
                <span className="font-serif-editorial text-6xl sm:text-7xl font-extralight text-neutral-700 block mb-2">
                  01
                </span>
                <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-[#EB0028] mb-3">

                </h3>
                <h2 className="font-serif-editorial text-3xl sm:text-4xl text-white font-normal uppercase tracking-wider">
                  ABOUT
                </h2>
                <p className="mt-4 text-xs font-mono tracking-widest text-neutral-500 uppercase">
                  A SHORT INTRODUCTION
                </p>
              </motion.div>
            </div>

            {/* Right Content Column */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="prose prose-invert max-w-none"
              >
                <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-neutral-300 font-light whitespace-pre-line tracking-wide">
                  {member.bio}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CONTRIBUTION TO TEDx (COMMENTED OUT)
        <section className="relative py-24 sm:py-32 px-6 sm:px-12 lg:px-20 border-t border-white/10 z-10 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 sm:gap-16">
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="sticky top-28"
              >
                <span className="font-serif-editorial text-6xl sm:text-7xl font-extralight text-neutral-700 block mb-2">
                  02
                </span>
                <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-[#EB0028] mb-3">
                  // ROLE & IMPACT
                </h3>
                <h2 className="font-serif-editorial text-3xl sm:text-4xl text-white font-normal uppercase tracking-wider">
                  CONTRIBUTION
                </h2>
                <p className="mt-4 text-xs font-mono tracking-widest text-neutral-500 uppercase">
                  WHAT I BRING TO TEDxGCEM
                </p>
              </motion.div>
            </div>

            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="border-l border-white/10 pl-6 sm:pl-10 py-2"
                style={{ borderColor: theme.accentColor }}
              >
                <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-neutral-300 font-light whitespace-pre-line tracking-wide">
                  {member.contribution}
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        */}

        {/* SECTION 5: BEYOND TEDx (INTERESTS) */}
        {parsedInterests.length > 0 && (
          <section className="relative py-24 sm:py-32 px-6 sm:px-12 lg:px-20 border-t border-white/10 z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 sm:gap-16">
              {/* Left Header Column */}
              <div className="lg:col-span-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="sticky top-28"
                >
                  <span className="font-serif-editorial text-6xl sm:text-7xl font-extralight text-neutral-700 block mb-2">
                    02
                  </span>
                  <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-[#EB0028] mb-3">
                    {'// PASSIONS & DISCIPLINE'}
                  </h3>
                  <h2 className="font-serif-editorial text-3xl sm:text-4xl text-white font-normal uppercase tracking-wider">
                    BEYOND TEDx
                  </h2>
                  <p className="mt-4 text-xs font-mono tracking-widest text-neutral-500 uppercase">
                    AREAS OF EXPLORATION
                  </p>
                </motion.div>
              </div>

              {/* Right Interactive List Column */}
              <div className="lg:col-span-8">
                <div className="divide-y divide-white/10 border-t border-b border-white/10">
                  {parsedInterests.map((interest, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      className="group py-6 sm:py-8 flex items-center justify-between transition-colors duration-300 hover:px-4"
                    >
                      <div className="flex items-center gap-6">
                        <span className="font-mono text-xs text-neutral-500 group-hover:text-[#EB0028] transition-colors">
                          0{idx + 1}
                        </span>
                        <span className="font-serif-editorial text-xl sm:text-3xl text-neutral-200 group-hover:text-white transition-colors tracking-wide">
                          {interest}
                        </span>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-neutral-600 transition-all duration-300 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 6: CONNECT / SOCIAL LINKS */}
        {socialLinks.length > 0 && (
          <section className="relative py-24 sm:py-32 px-6 sm:px-12 lg:px-20 border-t border-white/10 z-10 bg-white/[0.01]">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 sm:gap-16">
              {/* Left Header Column */}
              <div className="lg:col-span-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="sticky top-28"
                >
                  <span className="font-serif-editorial text-6xl sm:text-7xl font-extralight text-neutral-700 block mb-2">
                    03
                  </span>
                  <h3 className="text-xs font-mono tracking-[0.3em] uppercase text-[#EB0028] mb-3">
                    {'// CONNECT'}
                  </h3>
                  <h2 className="font-serif-editorial text-3xl sm:text-4xl text-white font-normal uppercase tracking-wider">
                    LET&apos;S CONNECT
                  </h2>
                  <p className="mt-4 text-xs font-mono tracking-widest text-neutral-500 uppercase">
                    DIRECT CHANNELS
                  </p>
                </motion.div>
              </div>

              {/* Right Social Logo Buttons Column */}
              <div className="lg:col-span-8">
                <div className="flex flex-wrap gap-4 sm:gap-5">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <motion.a
                        key={link.name}
                        href={link.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.3 }}
                        className="group relative flex items-center gap-3.5 border border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] px-5 py-3.5 rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg"
                      >
                        <Icon className="w-5 h-5 text-neutral-300 group-hover:text-[#EB0028] transition-colors" />
                        <span className="font-serif-editorial text-lg sm:text-xl text-neutral-200 group-hover:text-white transition-colors tracking-wide">
                          {link.name}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ml-1" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Global Footer (Matches Homepage Directory) */}
        <footer className="relative border-t border-white/10 bg-black/80 px-4 sm:px-6 py-8 backdrop-blur-md text-center text-xs text-gray-400 z-10">
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
    </ThemeProvider>
  );
}
