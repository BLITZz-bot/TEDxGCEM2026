import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ParticleBackground } from "@/components/ui/ParticleBackground";

export const metadata: Metadata = {
  title: "Privacy Policy | TEDxGCEM 2026",
  description: "Privacy Policy and Data Protection guidelines for TEDxGCEM attendees and delegates.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-ted-red selection:text-white font-sans relative overflow-hidden">
      <ParticleBackground />
      {/* Header Bar */}
      <header className="border-b border-white/10 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-ted-red font-black text-xl tracking-tight">TED<span className="lowercase">x</span></span>
            <span className="text-white font-bold text-xl tracking-tight">GCEM</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors flex items-center gap-2 border border-white/10 px-3.5 py-1.5 rounded-none hover:border-ted-red"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-10 pb-6 border-b border-white/10">
          <div className="inline-block px-2.5 py-1 mb-3 text-[10px] font-mono uppercase tracking-[0.2em] bg-ted-red/10 text-ted-red border border-ted-red/30">
            Legal & Compliance
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-white">
            Privacy Policy
          </h1>
          <p className="text-neutral-400 text-sm font-mono">
            Last Updated: March 2026 • Official Platform for TEDxGCEM
          </p>
        </div>

        <div className="space-y-10 text-neutral-300 text-sm md:text-base leading-relaxed">
          {/* Section 1: Overview */}
          <section className="bg-neutral-950/60 border border-white/10 p-6 md:p-8 rounded-none">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <span className="text-ted-red">01.</span> Overview & Purpose
            </h2>
            <p className="mb-3">
              <strong>TEDxGCEM</strong> (<a href="https://tedxgcem.in" className="text-ted-red underline">https://tedxgcem.in</a>) is an independently organized TEDx event operated under license from TED at Gopalan College of Engineering and Management, Bangalore.
            </p>
            <p>
              This website serves as the official delegate platform to provide event information, announce speakers, facilitate delegate registrations, issue verifiable entry passes, and deliver important event announcements.
            </p>
          </section>

          {/* Section 2: Data Collection & Google OAuth */}
          <section className="bg-neutral-950/60 border border-white/10 p-6 md:p-8 rounded-none">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <span className="text-ted-red">02.</span> Information We Collect & Google Sign-In
            </h2>
            <p className="mb-4">
              To provide a seamless, secure delegate experience, we offer Google Sign-In for authentication. When you sign in using your Google Account, we request only standard, non-sensitive profile permissions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-300 ml-2 font-mono text-xs md:text-sm">
              <li><strong className="text-white">Full Name:</strong> Used to personalize your registration and print your physical delegate badge.</li>
              <li><strong className="text-white">Email Address:</strong> Used as your unique delegate identifier, to send your ticket confirmation, QR entry pass, and event schedule updates.</li>
              <li><strong className="text-white">Profile Picture:</strong> Used solely to display your avatar inside the attendee portal.</li>
            </ul>
            <div className="mt-4 p-4 bg-white/5 border-l-2 border-ted-red text-xs md:text-sm text-neutral-300">
              <strong>Data Limitation:</strong> We do not access, request, or store your Google contacts, Google Drive files, private messages, or any sensitive scopes.
            </div>
          </section>

          {/* Section 3: How We Use Your Data */}
          <section className="bg-neutral-950/60 border border-white/10 p-6 md:p-8 rounded-none">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <span className="text-ted-red">03.</span> Purpose of Data Usage
            </h2>
            <p className="mb-3">We collect and use attendee data strictly for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Processing delegate pass registrations and validating ticket availability.</li>
              <li>Generating digital QR entry passes accessible via the &quot;Get My Pass&quot; portal.</li>
              <li>Transmitting transactional emails regarding payment confirmation and venue entry guidelines.</li>
              <li>Preventing fraudulent ticket duplicate claims and maintaining event security.</li>
            </ul>
          </section>

          {/* Section 4: Data Sharing & Protection */}
          <section className="bg-neutral-950/60 border border-white/10 p-6 md:p-8 rounded-none">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <span className="text-ted-red">04.</span> Data Protection & Third-Party Sharing
            </h2>
            <p className="mb-3">
              We respect your privacy and enforce strict technical safeguards:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-white">No Selling or Renting:</strong> We will never sell, trade, or rent your personal data to advertisers, sponsors, or third-party marketers.</li>
              <li><strong className="text-white">Secure Storage:</strong> All user records are protected via database Row Level Security (RLS) and encrypted transport (TLS 1.3).</li>
              <li><strong className="text-white">Authorized Sub-processors:</strong> We utilize industry-standard services including Supabase (Authentication & Database) and Resend (Transactional Email).</li>
            </ul>
          </section>

          {/* Section 5: Data Retention & User Rights */}
          <section className="bg-neutral-950/60 border border-white/10 p-6 md:p-8 rounded-none">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <span className="text-ted-red">05.</span> Your Rights & Data Deletion
            </h2>
            <p className="mb-3">
              You retain full control over your personal data. You may at any time:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Request an export of all personal information linked to your email address.</li>
              <li>Request the complete deletion of your registration and account records by contacting our organizing team.</li>
              <li>Revoke application access at any time through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-ted-red underline">Google Account Security Settings</a>.</li>
            </ul>
          </section>

          {/* Section 6: Contact Us */}
          <section className="bg-neutral-950/60 border border-white/10 p-6 md:p-8 rounded-none">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <span className="text-ted-red">06.</span> Contact & Grievance
            </h2>
            <p className="mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please reach out to our organizing committee:
            </p>
            <div className="font-mono text-xs md:text-sm space-y-1 text-neutral-400 bg-black/40 p-4 border border-white/5">
              <p><strong className="text-white">Organizing Committee:</strong> TEDxGCEM Team</p>
              <p><strong className="text-white">Institution:</strong> Gopalan College of Engineering and Management, Hoodi, Bangalore</p>
              <p><strong className="text-white">Email:</strong> <a href="mailto:tedxgcem@gmail.com" className="text-ted-red hover:underline">tedxgcem@gmail.com</a></p>
              <p><strong className="text-white">Website:</strong> <a href="https://tedxgcem.in" className="text-ted-red hover:underline">https://tedxgcem.in</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
