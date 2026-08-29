"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface UpiLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftId: string;
  authToken?: string;
  totalAmount: number;
  tierName: string;
  buyerName: string;
  buyerEmail: string;
  ticketQuantity: number;
  onPaymentConfirmed: () => void;
}

export default function UpiLaptopModal({
  isOpen,
  onClose,
  draftId,
  authToken,
  totalAmount,
  tierName,
  buyerName,
  buyerEmail,
  ticketQuantity,
  onPaymentConfirmed,
}: UpiLaptopModalProps) {
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "https://tedxgcem.in");

  // Handoff URL for mobile phone camera scan
  const handoffUrl = `${siteUrl}/?tab=register&draft_id=${draftId}${authToken ? `&token=${authToken}` : ""}`;

  // Polling listener for laptop auto-sync
  useEffect(() => {
    if (!isOpen || !draftId) return;

    let isMounted = true;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/register/draft-status?id=${draftId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "confirmed" && isMounted) {
          onPaymentConfirmed();
        }
      } catch {
        // silent polling retry
      }
    };

    // Initial check + poll every 3.5 seconds
    const interval = setInterval(pollStatus, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, draftId, onPaymentConfirmed]);

  // Hide navbar when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);


  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(handoffUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`/api/register/draft-status?id=${draftId}`);
      const data = await res.json();
      if (data.status === "confirmed") {
        onPaymentConfirmed();
      }
    } finally {
      setTimeout(() => setIsChecking(false), 600);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* 2-Column Split Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-4xl bg-[#0e0e0e] border border-white/15 rounded-[2.5rem] shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 max-h-[90vh]"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* LEFT COLUMN: Instructions & Details (7 Cols) */}
          <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-between space-y-6 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto">
            <div className="space-y-5">
              {/* Header badge */}
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-ted-red/15 border border-ted-red/30 text-ted-red text-[11px] font-mono font-bold uppercase tracking-wider">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile Payment Handoff</span>
                </span>
                <span className="text-[11px] font-mono text-white/40">
                  Step 2 of 2
                </span>
              </div>

              {/* Title & Summary */}
              <div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white font-sans">
                  Complete &amp; Pay on Phone
                </h3>
                <p className="text-xs text-white/60 font-sans mt-1">
                  UPI apps (Google Pay, PhonePe, Paytm) live on your smartphone. We saved your draft so you don&apos;t have to retype anything!
                </p>
              </div>

              {/* Order summary card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-sans">Delegate Tier</span>
                  <span className="font-bold text-white font-mono">{ticketQuantity} × {tierName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-sans">Primary Attendee</span>
                  <span className="text-white/90 font-mono truncate max-w-[200px]">{buyerName}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs font-bold text-white font-sans">Total Payable</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* The 4-Step Instructions */}
              <div className="space-y-3.5 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 font-mono">
                  Quick 30-Second Guide:
                </h4>

                <div className="flex items-start space-x-3 text-xs text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/10 text-white font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    1
                  </div>
                  <div>
                    <strong className="text-white block font-sans">Scan with your regular Phone Camera</strong>
                    <span className="text-white/60 text-[11px] leading-relaxed">
                      Point your iPhone camera or Android Camera / Google Lens at the QR code on the right. Tap the link.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/10 text-white font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    2
                  </div>
                  <div>
                    <strong className="text-white block font-sans">Your Details &amp; Login Are Already Saved!</strong>
                    <span className="text-white/60 text-[11px] leading-relaxed">
                      Your phone opens with your verified Google account ({buyerEmail}) and all attendee details pre-loaded.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/10 text-white font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    3
                  </div>
                  <div>
                    <strong className="text-white block font-sans">Pay via UPI &amp; Take Screenshot</strong>
                    <span className="text-white/60 text-[11px] leading-relaxed">
                      Tap &quot;Pay via UPI App&quot; to launch Google Pay or PhonePe. Pay the amount displayed on the screen and capture a clear screenshot showing the UTR number.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/10 text-white font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    4
                  </div>
                  <div>
                    <strong className="text-white block font-sans">Upload Proof &amp; Auto-Sync</strong>
                    <span className="text-white/60 text-[11px] leading-relaxed">
                      Upload the screenshot from your phone gallery. ✨ This laptop screen will automatically refresh and display your official pass!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom notification indicator */}
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400/90 font-mono bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Real-time sync active — no page refresh needed.</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Live QR Code & Sync Status (5 Cols) */}
          <div className="md:col-span-5 p-6 md:p-8 bg-[#090909] flex flex-col items-center justify-between space-y-6 text-center">
            {/* Label above QR */}
            <div className="w-full">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-white text-black text-[11px] font-mono font-bold uppercase tracking-wider">
                <span>📱</span>
                <span>Scan with Phone Camera</span>
              </span>
            </div>

            {/* The QR Container */}
            <div className="relative p-5 rounded-3xl bg-white shadow-2xl flex flex-col items-center justify-center border-4 border-white/20">
              <QRCodeSVG
                value={handoffUrl}
                size={190}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
              <div className="mt-3 text-[10px] font-mono uppercase tracking-wider text-black/70 font-black">
                Scan with Phone Camera
              </div>
            </div>

            {/* Status Indicator */}
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-center space-x-2 text-xs font-mono text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Waiting for mobile payment...</span>
              </div>
              <p className="text-[11px] text-white/40 font-mono">
                Session ID: {draftId.slice(-8)}
              </p>
            </div>

            {/* Action buttons */}
            <div className="w-full space-y-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-mono text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors border border-white/10 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Copy Phone Link"}</span>
              </button>

              <button
                onClick={handleManualCheck}
                disabled={isChecking}
                className="w-full py-2 text-[11px] font-mono text-white/50 hover:text-white transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
                <span>Already paid? Check status now</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
