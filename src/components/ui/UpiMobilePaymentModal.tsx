"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Smartphone,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Tag,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Sparkles,
} from "lucide-react";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import UtrHelpModal from "@/components/ui/UtrHelpModal";

interface UpiMobilePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftId?: string;
  totalAmount: number;
  tierName: string;
  buyerName: string;
  buyerEmail: string;
  attendees: Array<{
    fullName: string;
    email?: string;
    phone: string;
    organization?: string;
    designation?: string;
    linkedin?: string;
    referral?: string;
  }>;
  tierId: string;
  couponCode?: string | null;
  discountAmount?: number;
  /** True only when the page reloaded mid-payment (app-switch). Forces restore to proof step. */
  restoreSession?: boolean;
  onSuccess: (result: {
    confirmedCount: number;
    primaryRegistrationId: string;
    utrNumber: string;
    tierName: string;
  }) => void;
}

// Efficient image compressor: scales down screenshots to max 1280px and outputs high-quality JPEG DataURL
function compressImage(file: File): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 1280;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas error"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve({ dataUrl, blob });
            else resolve({ dataUrl, blob: file });
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => reject(new Error("Image load error"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

const SUBMISSION_PHASES = [
  {
    step: 1,
    title: "Encrypting Receipt Proof",
    desc: "Optimizing image data & generating security payload...",
    icon: Lock,
  },
  {
    step: 2,
    title: "Verifying 12-Digit UTR",
    desc: "Authenticating bank transaction reference with ledger...",
    icon: ShieldCheck,
  },
  {
    step: 3,
    title: "Securing Delegate Pass",
    desc: "Registering delegate credentials and tier access...",
    icon: Sparkles,
  },
  {
    step: 4,
    title: "Issuing Official Pass",
    desc: "Generating tamper-proof digital pass with QR code...",
    icon: CheckCircle2,
  },
];

export default function UpiMobilePaymentModal({
  isOpen,
  onClose,
  draftId,
  totalAmount,
  tierName,
  buyerName,
  attendees,
  couponCode,
  discountAmount,
  restoreSession = false,
  onSuccess,
}: UpiMobilePaymentModalProps) {
  // Step in modal: "instructions" | "proof"
  const [modalStep, setModalStep] = useState<"instructions" | "proof">("instructions");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileExpired, setTurnstileExpired] = useState(false);

  // Proof state
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionPhase, setSubmissionPhase] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "TEDxGCEM 2026";
  // Non-amount intent: removes dynamic merchant lock and lets user enter the amount manually in their UPI app
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&cu=INR&tn=TEDxGCEM`;

  // Discount display
  const originalAmount = discountAmount && discountAmount > 0 ? totalAmount + discountAmount : null;

  const [hasClickedPay, setHasClickedPay] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Cycle animated submission phases when submitting
  useEffect(() => {
    if (!isSubmitting) return;
    const interval = setInterval(() => {
      setSubmissionPhase((prev) => (prev < SUBMISSION_PHASES.length - 1 ? prev + 1 : prev));
    }, 1300);
    return () => {
      clearInterval(interval);
      setSubmissionPhase(0);
    };
  }, [isSubmitting]);

  const handleCopyUpi = () => {
    if (upiId && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // Detect mobile to show appropriate UPI button behaviour
  const isMobileDevice =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  // Check if returning to an in-progress payment, otherwise reset state
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");

      if (restoreSession) {
        try {
          const saved = sessionStorage.getItem("tedx_active_upi_session");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
              const restoreTimer = setTimeout(() => {
                setModalStep("proof");
                setHasAgreed(true);
                setHasClickedPay(true);
              }, 0);
              return () => clearTimeout(restoreTimer);
            }
          }
        } catch {}
      }

      // Fresh open: clear any stale session and reset all state
      try { sessionStorage.removeItem("tedx_active_upi_session"); } catch {}
      const timer = setTimeout(() => {
        setModalStep("instructions");
        setHasAgreed(false);
        setHasClickedPay(false);
        setTurnstileToken("");
        setTurnstileExpired(false);
        setUtrNumber("");
        setScreenshotFile(null);
        setScreenshotPreview(null);
        setErrorMsg(null);
        setIsSubmitting(false);
        setSubmissionPhase(0);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isOpen, restoreSession]);

  // Visibility change detection: When user actually returns from the external UPI app, switch to proof step
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && modalStep === "instructions" && hasClickedPay) {
        setModalStep("proof");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [modalStep, hasClickedPay]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        URL.revokeObjectURL(screenshotPreview);
      }
    };
  }, [screenshotPreview]);

  const processFile = useCallback(async (file: File) => {
    setErrorMsg(null);

    // Validate type
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type) && !file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, or WebP).");
      return;
    }

    setIsCompressing(true);
    try {
      const { dataUrl, blob } = await compressImage(file);
      const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
        type: "image/jpeg",
      });
      setScreenshotFile(optimizedFile);
      setScreenshotBase64(dataUrl);
      setScreenshotPreview(dataUrl);
    } catch {
      // Fallback: direct FileReader to DataURL
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setScreenshotFile(file);
        setScreenshotBase64(dataUrl);
        setScreenshotPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = () => setIsDraggingOver(false);
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleLaunchUpi = () => {
    setHasClickedPay(true);
    // Move to proof upload step without launching deep links (user pays manually via QR or UPI ID)
    setModalStep("proof");

    try {
      sessionStorage.setItem(
        "tedx_active_upi_session",
        JSON.stringify({
          draftId,
          modalStep: "proof",
          totalAmount,
          tierName,
          timestamp: Date.now(),
        })
      );
    } catch {}
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUtr = utrNumber.trim().toUpperCase();
    // NPCI UTR / UPI reference numbers: 8–22 alphanumeric chars.
    // Strictly \d{12} was rejecting valid Axis/ICICI/Google Pay references.
    if (!cleanUtr || !/^[A-Z0-9]{8,22}$/.test(cleanUtr)) {
      setErrorMsg("Please enter a valid UTR / transaction reference number (8–22 characters).");
      return;
    }

    if (!screenshotFile) {
      setErrorMsg("Please attach the payment receipt screenshot.");
      return;
    }

    // Turnstile expiry guard
    if (turnstileExpired || !turnstileToken) {
      setErrorMsg("Security verification expired. Please scroll up to re-verify, then retry.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Always use FormData — avoids iOS canvas.toDataURL() restriction and
      // eliminates the server-side content-type ambiguity that caused empty utrNumber.
      const formData = new FormData();
      formData.append("draftId", draftId ?? "");
      formData.append("utrNumber", cleanUtr);
      formData.append("turnstileToken", turnstileToken ?? "");

      if (screenshotFile) {
        // Direct compressed/original File instance
        formData.append("screenshot", screenshotFile, screenshotFile.name || `proof_${draftId}.jpg`);
      } else if (screenshotBase64) {
        // Safe in-memory base64 to Blob conversion without fetch()
        try {
          const parts = screenshotBase64.split(",");
          const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          formData.append("screenshot", blob, `proof_${draftId}.jpg`);
        } catch {
          // Last resort fallback
          const base64Response = await fetch(screenshotBase64);
          const blob = await base64Response.blob();
          formData.append("screenshot", blob, `proof_${draftId}.jpg`);
        }
      }

      const res = await fetch("/api/register/upi-submit", {
        method: "POST",
        body: formData,
      });


      const contentType = res.headers.get("content-type") || "";
      let data: { error?: string; confirmedCount?: number; primaryRegistrationId?: string } = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Server returned status ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Submission failed. Please check details and retry.");
      }

      try {
        sessionStorage.removeItem("tedx_active_upi_session");
      } catch {}

      // Only call onSuccess if truly successful (do NOT reset isSubmitting — modal will unmount)
      onSuccess({
        confirmedCount: data.confirmedCount || attendees.length,
        primaryRegistrationId: data.primaryRegistrationId || `UPI-${cleanUtr}`,
        utrNumber: cleanUtr,
        tierName,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit verification.";
      setErrorMsg(message);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0e0e0e] border border-white/15 rounded-[2rem] shadow-2xl overflow-hidden z-10 p-6 md:p-8 space-y-6 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-ted-red/20 border border-ted-red/40 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-ted-red" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight font-sans">
                  Direct UPI Payment
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  TEDxGCEM 2026 • Official Pass Checkout
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`p-2 rounded-full text-white/60 hover:text-white transition-colors ${
                isSubmitting ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10 cursor-pointer"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* VIEW: SUBMITTING ANIMATION (Shows when user clicks submit) */}
          {isSubmitting && (
            <div className="py-8 px-2 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-300">
              {/* Animated Concentric Radar Glow */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full border border-ted-red/40 animate-ping opacity-30" />
                {/* Middle rotating gradient ring */}
                <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-t-ted-red border-r-emerald-400 animate-spin duration-1000" />
                {/* Glowing Core */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ted-red/25 via-white/5 to-emerald-500/20 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-[0_0_35px_rgba(235,0,40,0.4)]">
                  <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
                </div>
              </div>

              {/* Dynamic Phase Text */}
              <div className="space-y-1.5 max-w-sm">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Stage {submissionPhase + 1} of {SUBMISSION_PHASES.length}</span>
                </div>
                <h4 className="text-base font-bold text-white font-sans tracking-tight">
                  {SUBMISSION_PHASES[submissionPhase]?.title}
                </h4>
                <p className="text-xs text-white/60 font-sans">
                  {SUBMISSION_PHASES[submissionPhase]?.desc}
                </p>
              </div>

              {/* Animated Glowing Progress Bar */}
              <div className="w-full max-w-xs space-y-1.5">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-ted-red via-amber-400 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    style={{ width: `${((submissionPhase + 1) / SUBMISSION_PHASES.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                  <span>Processing UTR: {utrNumber.slice(0, 4)}••••{utrNumber.slice(-4)}</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(((submissionPhase + 1) / SUBMISSION_PHASES.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Phase Step Badges */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-sm pt-1">
                {SUBMISSION_PHASES.map((ph, idx) => {
                  const PhaseIcon = ph.icon;
                  return (
                    <div
                      key={ph.step}
                      className={`p-2 rounded-xl border flex flex-col items-center space-y-1 transition-all ${
                        idx < submissionPhase
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : idx === submissionPhase
                          ? "bg-ted-red/15 border-ted-red/60 text-ted-red shadow-[0_0_15px_rgba(235,0,40,0.3)]"
                          : "bg-white/[0.02] border-white/5 text-white/20"
                      }`}
                    >
                      {idx < submissionPhase ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <PhaseIcon className={`w-3.5 h-3.5 ${idx === submissionPhase ? "animate-bounce" : ""}`} />
                      )}
                      <span className="text-[9px] font-mono uppercase tracking-wider line-clamp-1">
                        Step {ph.step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Security Guarantee Notice */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/50 font-mono max-w-sm">
                🔒 256-bit SSL Encrypted Verification • Please do not close or reload this page.
              </div>
            </div>
          )}

          {/* Amount Badge */}
          {!isSubmitting && (
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-white/50 block font-mono">
                  {attendees.length} × {tierName} Pass
                </span>
                <span className="text-xs text-white/80 font-sans font-medium">
                  Delegate: {buyerName}
                </span>
                {couponCode && (
                  <span className="inline-flex items-center space-x-1 mt-1 text-[10px] text-emerald-400 font-mono">
                    <Tag className="w-2.5 h-2.5" />
                    <span>Coupon {couponCode} applied</span>
                  </span>
                )}
              </div>
              <div className="text-right">
                {originalAmount && (
                  <span className="text-xs line-through text-white/30 font-mono block">
                    ₹{originalAmount.toFixed(2)}
                  </span>
                )}
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* VIEW 1: INSTRUCTIONS & QR PAYMENT */}
          {!isSubmitting && modalStep === "instructions" && (
            <div className="space-y-5">
              {/* Official QR Code Card */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-center">
                <div className="relative p-2 bg-white rounded-2xl shadow-xl max-w-[240px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/qr-pay.jpeg"
                    alt="TEDxGCEM Official UPI QR Code"
                    className="w-52 h-52 object-contain rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/50 block">
                    📸 Take a screenshot of this QR to scan in your UPI app
                  </span>
                  <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold shadow-sm">
                    <span>Pay Exact Amount for {tierName}: ₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/40 block">
                  How to Complete Payment:
                </span>
                <div className="space-y-2 text-xs text-white/80">
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-mono text-ted-red font-bold text-[11px]">1.</span>
                    <span><strong>Screenshot QR:</strong> Take a screenshot of the official QR code above (or copy the UPI ID below).</span>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <span className="font-mono text-amber-400 font-bold text-[11px]">2.</span>
                    <span><strong>Pay in UPI App:</strong> Open Google Pay, PhonePe, or Paytm, select <em>&ldquo;Scan from Gallery&rdquo;</em>, and enter exactly <strong>₹{totalAmount.toFixed(2)}</strong>.</span>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-mono text-ted-red font-bold text-[11px]">3.</span>
                    <span><strong>Capture Screenshot & UTR:</strong> Take a screenshot of the completed payment receipt showing the 12-digit UTR.</span>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-mono text-ted-red font-bold text-[11px]">4.</span>
                    <span><strong>Submit Verification:</strong> Tap the button below to paste your 12-digit UTR and upload your payment screenshot.</span>
                  </div>
                </div>
              </div>

              {/* Official UPI ID Copy Card (Placed after instructions) */}
              {upiId && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                      Or Pay Manually via Official UPI ID:
                    </span>
                    <span className="font-mono text-xs text-white font-semibold select-all">
                      {upiId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white/70" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Checkbox Gate */}
              <label className="flex items-start space-x-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-ted-red focus:ring-ted-red accent-ted-red cursor-pointer"
                />
                <span className="text-xs text-white/80 leading-relaxed font-sans">
                  I have read all instructions.
                </span>
              </label>

              {/* Proceed to Upload Proof CTA */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  disabled={!hasAgreed}
                  onClick={() => {
                    if (!hasAgreed) return;
                    handleLaunchUpi();
                  }}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 font-mono ${
                    hasAgreed
                      ? "bg-ted-red hover:bg-white text-white hover:text-black cursor-pointer shadow-[0_0_25px_rgba(235,0,40,0.4)]"
                      : "bg-white/10 text-white/30 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  <span>I Have Paid ₹{totalAmount.toFixed(2)} — Upload Proof</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: PROOF SUBMISSION */}
          {!isSubmitting && modalStep === "proof" && (
            <form onSubmit={handleSubmitProof} className="space-y-5">
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setModalStep("instructions")}
                  className="text-xs text-white/60 hover:text-white font-mono flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>← Back to Instructions &amp; QR</span>
                </button>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                  Step 2 of 2
                </span>
              </div>
              {/* Payment recap banner */}
              {upiId && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-white/70">
                    <span className="font-mono text-[11px] text-white/40">UPI ID:</span>
                    <span className="font-mono text-white font-medium select-all">{upiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="text-[11px] text-ted-red hover:underline font-mono flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedUpi ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 12-Digit Numeric UTR Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    12-Digit Bank UTR / Ref No. <span className="text-ted-red">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUtrHelp(true)}
                    className="text-[11px] text-ted-red hover:underline font-mono flex items-center space-x-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Where do I find UTR?</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={12}
                    placeholder="e.g. 423981029384"
                    value={utrNumber}
                    onChange={(e) => {
                      // Allow alphanumeric; uppercase for consistency; max 22 chars
                      const val = e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 22).toUpperCase();
                      setUtrNumber(val);
                    }}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm tracking-widest placeholder-white/20 focus:outline-none focus:border-ted-red transition-colors"
                  />
                  {utrNumber.length >= 8 && utrNumber.length <= 22 && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-white/40 font-mono">
                  Must be exactly 12 numeric digits from your UPI payment receipt.
                </p>
              </div>

              {/* Screenshot Upload with drag & drop */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Payment Receipt Screenshot <span className="text-ted-red">*</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!screenshotPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                      isDraggingOver
                        ? "border-ted-red/80 bg-ted-red/10"
                        : "border-white/20 hover:border-ted-red/60 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-sans text-white/80 font-medium">
                      {isCompressing ? "Optimizing image..." : isDraggingOver ? "Drop here to upload" : "Tap to choose screenshot from gallery"}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      PNG, JPG, or WebP • Auto-compressed if &gt;1.5MB • Drag &amp; drop supported
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/15 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot proof"
                        className="w-14 h-14 object-cover rounded-xl border border-white/10"
                      />
                      <div>
                        <span className="text-xs font-mono font-bold text-white block truncate max-w-[170px]">
                          {screenshotFile?.name || "screenshot.png"}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          Image ready for verification
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Security verification — on proof step so it's always solved before submit */}
              <TurnstileWidget
                onSuccess={(token) => {
                  setTurnstileToken(token);
                  setTurnstileExpired(false);
                  setErrorMsg(null);
                }}
                onError={(err) => {
                  setTurnstileToken("");
                  setErrorMsg(
                    err
                      ? `Security challenge note (${err}). If testing locally, ensure localhost is in your Cloudflare Turnstile allowed domains or test keys.`
                      : "Security check failed to initialize. Please refresh the page and try again."
                  );
                }}
                onExpire={() => {
                  setTurnstileToken("");
                  setTurnstileExpired(true);
                }}
              />
              {turnstileExpired && (
                <p className="text-[11px] text-amber-400 font-mono text-center">
                  ⚠ Security check expired. Please wait for it to auto-refresh.
                </p>
              )}

              {/* Submit CTA */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || utrNumber.length < 8 || !screenshotFile || !turnstileToken}
                  className={`relative group overflow-hidden w-full py-4 px-6 rounded-2xl font-black text-xs md:text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-2.5 font-mono shadow-2xl select-none ${
                    !isSubmitting && utrNumber.length >= 8 && screenshotFile && turnstileToken
                      ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-black border border-emerald-300/50 shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      : "bg-white/[0.04] border border-white/10 text-white/30 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  {/* Subtle light shimmer sweep on hover */}
                  {!isSubmitting && (
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                  )}

                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-black" />
                      <span className="relative z-10 font-black">Verifying &amp; Issuing Pass...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-black" />
                      <span className="relative z-10 font-black">Submit Proof &amp; Generate Pass</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalStep("instructions")}
                  className="w-full py-2 text-xs font-mono text-white/40 hover:text-white transition-colors cursor-pointer text-center block"
                >
                  ← Re-read payment instructions
                </button>
              </div>
            </form>
          )}

          {/* UTR Help Modal */}
          <UtrHelpModal isOpen={showUtrHelp} onClose={() => setShowUtrHelp(false)} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
