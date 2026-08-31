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
  onSuccess: (result: {
    confirmedCount: number;
    primaryRegistrationId: string;
    utrNumber: string;
    tierName: string;
  }) => void;
}

export default function UpiMobilePaymentModal({
  isOpen,
  onClose,
  draftId,
  totalAmount,
  tierName,
  buyerName,
  buyerEmail,
  attendees,
  tierId,
  couponCode,
  discountAmount,
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
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "TEDxGCEM 2026";
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${totalAmount.toFixed(2)}&mam=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`TEDxGCEM ${tierName} Pass`)}`;

  // Discount display
  const originalAmount = discountAmount && discountAmount > 0 ? totalAmount + discountAmount : null;

  const [hasClickedPay, setHasClickedPay] = useState(false);
  // Detect mobile to show appropriate UPI button behaviour
  const isMobileDevice =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  // Reset ALL state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
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
      }, 0);
      return () => clearTimeout(timer);
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);

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

  // Canvas image compression for photos > 1.5 MB
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDimension = 1600;

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

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Compression failed"));
            },
            "image/webp",
            0.82
          );
        };
        img.onerror = () => reject(new Error("Image load error"));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsDataURL(file);
    });
  };

  const processFile = useCallback(async (file: File) => {
    setErrorMsg(null);

    // Validate type
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type)) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size <= 1.5 * 1024 * 1024) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
      return;
    }

    // Compress large phone screenshots
    setIsCompressing(true);
    try {
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, {
        type: "image/webp",
      });
      setScreenshotFile(compressedFile);
      setScreenshotPreview(URL.createObjectURL(compressedBlob));
    } catch {
      // Fallback to original file
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
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
    if (!isMobileDevice) {
      // Desktop — UPI deep links only work on mobile UPI apps
      setModalStep("proof");
      return;
    }
    // Open UPI deep link on mobile
    window.location.href = upiUri;
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || !/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg("Please enter a valid 12-digit numeric UTR number.");
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
      const formData = new FormData();
      formData.append("utrNumber", cleanUtr);
      formData.append("screenshot", screenshotFile);
      formData.append("turnstileToken", turnstileToken);
      if (draftId) formData.append("draftId", draftId);
      formData.append("tierId", tierId);
      formData.append("tierName", tierName);
      formData.append("amount", totalAmount.toString());
      formData.append("buyerEmail", buyerEmail);
      formData.append("attendees", JSON.stringify(attendees));
      if (couponCode) formData.append("couponCode", couponCode);
      if (discountAmount) formData.append("discountAmount", discountAmount.toString());

      const res = await fetch("/api/register/upi-submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed. Please check details and retry.");
      }

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
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Amount Badge */}
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

          {/* VIEW 1: INSTRUCTIONS */}
          {modalStep === "instructions" && (
            <div className="space-y-5">
              {/* The 5 Golden Rules */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/40 block">
                  5 Golden Instructions:
                </span>
                <div className="space-y-2 text-xs text-white/80">
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-mono text-ted-red font-bold text-[11px]">1.</span>
                    <span><strong>Direct UPI App:</strong> Tapping the button shows your installed UPI apps — simply select the one you want to use (Google Pay, PhonePe, Paytm, etc.).</span>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-mono text-ted-red font-bold text-[11px]">2.</span>
                    <span><strong>Pay the Amount:</strong> The exact amount is automatically loaded into your UPI app for instant verification.</span>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-mono text-ted-red font-bold text-[11px]">3.</span>
                    <span><strong>Take Screenshot:</strong> Capture a clear screenshot of the payment showing the UTR number on the screen.</span>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-mono text-ted-red font-bold text-[11px]">4.</span>
                    <span><strong>Record 12-Digit UTR:</strong> Note down the UPI Transaction Ref / UTR number from the receipt.</span>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-mono text-ted-red font-bold text-[11px]">5.</span>
                    <span><strong>Finalize Pass:</strong> Return to this browser tab to upload the screenshot and paste your UTR.</span>
                  </div>
                </div>
              </div>

              {/* Checkbox Gate */}
              <label className="flex items-start space-x-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-ted-red focus:ring-ted-red accent-ted-red cursor-pointer"
                />
                <span className="text-xs text-white/80 leading-relaxed font-sans">
                  I have read and agree to all payment instructions. I will take a screenshot of the receipt and note the 12-digit UTR.
                </span>
              </label>

              {/* Launch Payment CTA */}
              <div className="space-y-2 pt-1">
                {!isMobileDevice && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start space-x-2">
                    <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Mobile required:</strong> UPI deep links open Google Pay, PhonePe, or
                      Paytm on your phone. If you&apos;ve already paid on mobile, tap the button below to
                      go directly to proof upload.
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleLaunchUpi}
                  disabled={!hasAgreed}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 font-mono ${
                    hasAgreed
                      ? "bg-ted-red hover:bg-white text-white hover:text-black cursor-pointer shadow-[0_0_25px_rgba(235,0,40,0.4)]"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  <span>
                    {isMobileDevice
                      ? `Proceed to Pay ₹${totalAmount.toFixed(2)} via UPI App`
                      : `Already Paid on Mobile? Upload Proof ₹${totalAmount.toFixed(2)}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setModalStep("proof")}
                  className="w-full py-2.5 text-[11px] font-mono text-white/50 hover:text-white transition-colors cursor-pointer text-center"
                >
                  Already paid? Skip directly to UTR &amp; Screenshot Upload ➔
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: PROOF SUBMISSION */}
          {modalStep === "proof" && (
            <form onSubmit={handleSubmitProof} className="space-y-5">
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
                      const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                      setUtrNumber(val);
                    }}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm tracking-widest placeholder-white/20 focus:outline-none focus:border-ted-red transition-colors"
                  />
                  {utrNumber.length === 12 && (
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
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || utrNumber.length !== 12 || !screenshotFile || !turnstileToken}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 font-mono ${
                    !isSubmitting && utrNumber.length === 12 && screenshotFile && turnstileToken
                      ? "bg-emerald-500 hover:bg-white text-black hover:text-black cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying &amp; Issuing Pass...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Proof &amp; Generate Delegate Pass</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalStep("instructions")}
                  className="w-full py-2 text-[11px] font-mono text-white/50 hover:text-white transition-colors cursor-pointer text-center"
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
