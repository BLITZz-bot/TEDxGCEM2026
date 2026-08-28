import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ParticleBackground } from "@/components/ui/ParticleBackground";

export const metadata: Metadata = {
  title: "Terms of Service | TEDxGCEM 2026",
  description: "Terms and conditions for TEDxGCEM attendees and delegates.",
};

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="text-neutral-400 text-sm font-mono">
            Last Updated: March 2026 • TEDxGCEM Delegate Agreement
          </p>
        </div>

        <div className="space-y-10 text-neutral-300 text-sm md:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="bg-neutral-950/60 border border-white/10 p-6 md:p-8 rounded-none">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <span className="text-ted-red">01.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing the TEDxGCEM portal (<a href="https://tedxgcem.in" className="text-ted-red underline">https://tedxgcem.in</a>), authenticating with Google Sign-In, or purchasing a delegate pass, you agree to comply with and be bound by these Terms of Service and all applicable TEDx rules.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-neutral-950/60 border border-white/10 p-6 md:p-8 rounded-none">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <span className="text-ted-red">02.</span> Event Ticketing & Entry Passes
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Each ticket is personal and non-transferable unless explicitly approved by the organizers.</li>
              <li>Attendees must present their verified digital QR pass along with a valid photo ID at the registration desk on the event day.</li>
              <li>Passes acquired through fraudulent means or unauthorized duplication will be revoked immediately without refund.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-neutral-950/60 border border-white/10 p-6 md:p-8 rounded-none">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <span className="text-ted-red">03.</span> Code of Conduct
            </h2>
            <p className="mb-3">
              TEDx is a community centered around ideas worth spreading. All delegates, speakers, and volunteers are expected to foster a respectful, inclusive, and harassment-free environment.
            </p>
            <p>
              Organizers reserve the right to deny entry or eject individuals violating safety guidelines or code of conduct.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-neutral-950/60 border border-white/10 p-6 md:p-8 rounded-none">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2 font-mono">
              <span className="text-ted-red">04.</span> Contact Information
            </h2>
            <p>
              For inquiries regarding registration, ticket support, or terms, contact us at <a href="mailto:tedxgcem@gmail.com" className="text-ted-red hover:underline">tedxgcem@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
