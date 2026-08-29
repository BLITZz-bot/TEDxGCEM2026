"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, CheckCircle2 } from "lucide-react";

interface UtrHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UtrHelpModal({ isOpen, onClose }: UtrHelpModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#111] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden z-10 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-ted-red/20 border border-ted-red/40 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-ted-red" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight font-sans">
                  What is a 12-Digit UTR?
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Unique Transaction Reference / Ref No.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Explanation */}
          <p className="text-xs text-white/70 leading-relaxed font-sans">
            Every UPI payment generates a unique 12-digit numeric reference issued by the Reserve Bank of India (NPCI). We use this number to link your payment proof to your official TEDxGCEM delegate ticket.
          </p>

          {/* App breakdown */}
          <div className="space-y-3">
            {/* Google Pay */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Google Pay (GPay)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                  UPI Ref No.
                </span>
              </div>
              <p className="text-xs text-white/60 font-sans">
                Open the transaction receipt → Look for <strong>&quot;UPI transaction ID&quot;</strong> or <strong>&quot;Google transaction ID&quot;</strong> (e.g. <code className="text-emerald-400 font-mono">423981029384</code>).
              </p>
            </div>

            {/* PhonePe */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  PhonePe
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono">
                  UTR
                </span>
              </div>
              <p className="text-xs text-white/60 font-sans">
                Open the payment details screen → Look for <strong>&quot;UTR&quot;</strong> right under the Debited From section (e.g. <code className="text-emerald-400 font-mono">423981029384</code>).
              </p>
            </div>

            {/* Paytm */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Paytm / BHIM / CRED
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  UPI Ref ID
                </span>
              </div>
              <p className="text-xs text-white/60 font-sans">
                View order / transfer summary → Look for <strong>&quot;UPI Ref No&quot;</strong> or <strong>&quot;Bank Reference Number&quot;</strong> (12 digits).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>It is always exactly 12 numeric digits (no letters or symbols).</span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-white hover:bg-ted-red text-black hover:text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all font-mono"
          >
            Got it, return to submission
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
