"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabId } from "@/components/ui/TabNav";
import { useAuth } from "@/hooks/useAuth";
import { EventSettings } from "@/lib/settings-service";
import { getEventYear } from "@/lib/utils";

interface RegisterNowProps {
  onTabChange: (id: TabId) => void;
  settings?: EventSettings | null;
}

interface ActiveTierInfo {
  id: string;
  name: string;
  tag: string;
  description: string;
  price: number;
  discount_price: number | null;
  allow_coupons: boolean;
  status: string;
}

interface AppliedCouponInfo {
  code: string;
  originalPrice: number;
  discountAmount: number;
  finalAmount: number;
  discountPercentage: number;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function RegisterNow({ onTabChange, settings }: RegisterNowProps) {
  const { user, loading, loginWithGoogle } = useAuth();
  
  // Navigation Steps:
  // "tier_card" (Screen 1: Beautiful Active Ticket Showcase)
  // "intro_pillars" (Screen 2: "Be in the Room Where Ideas Ignite" with 3 pillars from screenshot)
  // "form" (Screen 3: Registration Form + Coupon + Razorpay Checkout)
  const [step, setStep] = useState<"tier_card" | "intro_pillars" | "form">("tier_card");

  const [activeTier, setActiveTier] = useState<ActiveTierInfo>({
    id: "early_bird",
    name: "Early Bird",
    tag: "Priority Pass",
    description: "Exclusive early bird access pass with curated kit and all speaker sessions.",
    price: 300,
    discount_price: null,
    allow_coupons: false,
    status: "active",
  });

  const [allPublicTiers, setAllPublicTiers] = useState<ActiveTierInfo[]>([]);
  const [tierLoading, setTierLoading] = useState(true);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    designation: "Student",
    linkedin: "",
    referral: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | null>(null);

  // Fetch active ticket tier on load
  useEffect(() => {
    let isMounted = true;
    fetch("/api/tickets")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.activeTier) {
          setActiveTier(data.activeTier);
        }
        if (data.tiers && Array.isArray(data.tiers)) {
          setAllPublicTiers(data.tiers);
        }
      })
      .catch((err) => console.warn("Failed to fetch active tier:", err))
      .finally(() => {
        if (isMounted) setTierLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Autofill user credentials when auth state loads
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        setFormData((prev) => ({
          ...prev,
          email: user.email || "",
          fullName: user.user_metadata?.full_name || prev.fullName,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          email: "",
        }));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  // Scroll smoothly to top of register section whenever step changes
  useEffect(() => {
    if (step !== "tier_card") {
      const section = document.getElementById("register-section");
      if (section) {
        const yOffset = -90;
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    }
  }, [step]);

  // Handle Coupon Validation
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponValidating(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error || "Invalid or expired coupon code.");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          originalPrice: data.originalPrice,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount,
          discountPercentage: data.discountPercentage,
        });
        setCouponError(null);
      }
    } catch {
      setCouponError("Failed to validate coupon. Please check connection.");
      setAppliedCoupon(null);
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,14}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    
    if (!formData.organization.trim()) newErrors.organization = "College / Organization is required";
    if (!formData.designation.trim()) newErrors.designation = "Please select your designation / role";
    
    // Validate LinkedIn URL format only if provided
    if (formData.linkedin.trim() && !/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i.test(formData.linkedin.trim())) {
      newErrors.linkedin = "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmitAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user) {
      await loginWithGoogle();
      return;
    }

    setIsSubmitting(true);
    if (errors.submit) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.submit;
        return copy;
      });
    }

    try {
      // 1. Create Razorpay order on server (price & coupon verified server-side)
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create payment order.");
      }

      // 2. Load Checkout script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay payment SDK. Please check your network connection.");
      }

      // 3. Configure Razorpay Popup options
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TEDxGCEM 2026",
        description: `${activeTier.name} Attendee Pass`,
        image: "/favicon.ico",
        order_id: orderData.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#EB0028", // TED Red
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          try {
            // 4. Verify Payment Server-Side
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                fullName: formData.fullName,
                phone: formData.phone,
                organization: formData.organization,
                designation: formData.designation,
                linkedin: formData.linkedin,
                referral: formData.referral,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            setVerifiedPaymentId(response.razorpay_payment_id);
            setIsSuccess(true);
          } catch (verifyError: unknown) {
            console.error("Verification error:", verifyError);
            const msg = verifyError instanceof Error ? verifyError.message : "Payment verification failed.";
            setErrors((prev) => ({ ...prev, submit: msg }));
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: { error?: { description?: string } }) {
        setIsSubmitting(false);
        setErrors((prev) => ({
          ...prev,
          submit: response.error?.description || "Payment failed or cancelled. Please try again.",
        }));
      });
      rzp.open();
    } catch (err: unknown) {
      console.error("Error initiating payment:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to initiate payment. Please try again.";
      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Compute final display price in form
  const payablePrice = appliedCoupon ? appliedCoupon.finalAmount : activeTier.price;

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col">
      {/* Hero Banner Manifesto */}
      <div className="w-full mb-16 flex flex-col justify-between items-start gap-6 border-b border-white/10 pb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase"
        >
          JOIN THE <br />
          CONVERSATION <span className="text-ted-red">TODAY</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-xl"
        >
          Secure your spot at TEDxGCEM {getEventYear(settings?.event_date)}. Limited seats are available for selected applicants. Apply now to be part of the experience.
        </motion.p>
      </div>

      {settings?.reveal_register === false ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-ted-dark-gray/50 border border-white/10 p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm text-center space-y-8 relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-ted-red/10 blur-[80px] rounded-full" />
          
          <div className="w-20 h-20 bg-ted-red/20 border border-ted-red/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EB0028" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="space-y-3">
            <h4 className="text-3xl font-black uppercase tracking-tight text-white">Registration Opens Soon</h4>
            <p className="text-white/60 max-w-md mx-auto text-xs leading-relaxed font-sans font-light">
              Attendee pass registrations for TEDxGCEM {getEventYear(settings?.event_date)} are opening soon. Follow our official channels for release details.
            </p>
          </div>
          <button 
            onClick={() => onTabChange("home")}
            className="px-8 py-4 bg-ted-red hover:bg-white text-white hover:text-black font-black rounded-full text-xs transition-all uppercase tracking-widest cursor-pointer border border-ted-red shadow-[0_0_15px_rgba(235,0,40,0.25)] font-mono"
          >
            Return Home
          </button>
        </motion.div>
      ) : (
        <div className="w-full relative">
          {loading || tierLoading ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-20 bg-ted-dark-gray/30 rounded-[2rem] border border-white/5">
              <div className="w-10 h-10 border-4 border-ted-red border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono uppercase tracking-widest text-white/40">Loading Ticket Passes...</span>
            </div>
          ) : isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-ted-dark-gray/50 border border-green-500/30 p-8 md:p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm text-center space-y-6 relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-mono font-black uppercase tracking-widest rounded-full">
                  Payment Verified & Confirmed
                </span>
                <h4 className="text-3xl font-black uppercase tracking-tight text-white">
                  Welcome to TEDxGCEM {getEventYear(settings?.event_date)}!
                </h4>
                <p className="text-white/60 max-w-lg mx-auto text-sm leading-relaxed font-light">
                  Your registration for <strong className="text-white">{activeTier.name}</strong> is fully confirmed. Your delegate pass has been issued and stored securely.
                </p>
                {verifiedPaymentId && (
                  <p className="text-xs font-mono text-white/40 pt-1">
                    Payment Reference: <span className="text-white/80">{verifiedPaymentId}</span>
                  </p>
                )}
              </div>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => onTabChange("get-pass")}
                  className="px-8 py-4 bg-ted-red hover:bg-white text-white hover:text-black font-black rounded-xl text-xs transition-all uppercase tracking-widest cursor-pointer border border-ted-red shadow-[0_0_20px_rgba(235,0,40,0.3)] font-mono flex items-center gap-2"
                >
                  <span>Download My Pass</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button
                  onClick={() => onTabChange("home")}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-mono uppercase tracking-widest text-xs rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {/* ════════════════════════════════════════════════════════════════════
                  SCREEN 1: BEAUTIFUL ACTIVE TICKET TIER SHOWCASE CARD
                  ════════════════════════════════════════════════════════════════════ */}
              {step === "tier_card" && (
                <motion.div
                  key="tier_showcase"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full space-y-8"
                >
                  <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ted-red/10 border border-ted-red/20 text-ted-red text-[11px] uppercase tracking-[0.2em] font-black font-mono shadow-[0_0_15px_rgba(235,0,40,0.1)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-ted-red animate-ping" />
                      Official Attendee Admission
                    </span>
                    
                    <h3 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tight text-white leading-tight">
                      BE IN THE ROOM WHERE <br />
                      <span className="text-ted-red">
                        IDEAS IGNITE
                      </span>
                    </h3>

                    <p className="text-white/70 text-xs md:text-sm font-light leading-relaxed max-w-2xl mx-auto">
                      TEDxGCEM {getEventYear(settings?.event_date)} is more than a stage. It&apos;s a convergence of visionaries, catalysts, and innovators pushing the boundaries of what is possible. Join us for a day filled with mind-expanding talks, electrifying performances, and networking opportunities that could redefine your trajectory.
                    </p>
                  </div>

                  {/* TICKET TIERS GRID (2 in a Row, Clean Wide Cyber-Luxury Pass Design) */}
                  {(() => {
                    const displayTiers = allPublicTiers.length > 0 ? allPublicTiers : [activeTier];

                    return (
                      <div
                        className={`grid gap-6 mx-auto items-stretch w-full pt-4 ${
                          displayTiers.length === 1
                            ? "max-w-xl"
                            : "grid-cols-1 md:grid-cols-2 max-w-4xl"
                        }`}
                      >
                        {displayTiers.map((tier, idx) => {
                          const isLive = tier.status === "active";
                          const isSoldOut = tier.status === "sold_out";
                          const isClosed = tier.status === "closed";
                          const phaseNumber = String(idx + 1).padStart(2, "0");

                          return (
                            <div
                              key={tier.id}
                              onClick={() => {
                                if (isLive) {
                                  setActiveTier(tier);
                                  setStep("intro_pillars");
                                }
                              }}
                              className={`group relative rounded-[2.25rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-500 overflow-hidden ${
                                isLive
                                  ? "cursor-pointer bg-gradient-to-br from-[#1f0d12] via-[#130709] to-[#070709] border-2 border-ted-red shadow-[0_0_50px_rgba(235,0,40,0.35)] hover:shadow-[0_0_75px_rgba(235,0,40,0.55)] transform hover:-translate-y-2"
                                  : isSoldOut
                                  ? "bg-[#0b0b0f]/80 border border-white/10 opacity-70 backdrop-blur-md"
                                  : isClosed
                                  ? "bg-[#0b0b0f]/80 border border-yellow-500/20 opacity-80 backdrop-blur-md"
                                  : "bg-[#0b0b0f]/50 border border-white/5 opacity-50"
                              }`}
                            >
                              {/* Ambient Glowing Backlight for Live Card */}
                              {isLive && (
                                <>
                                  <div className="absolute -top-12 -right-12 w-56 h-56 bg-ted-red/25 blur-[80px] rounded-full pointer-events-none group-hover:bg-ted-red/40 transition-all duration-500" />
                                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-ted-red/15 blur-[70px] rounded-full pointer-events-none" />
                                </>
                              )}

                              <div className="relative z-10 space-y-6">
                                {/* Top Meta Row: Tier Number & Live Status Pill */}
                                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                                  <div className="flex items-center gap-2 font-mono">
                                    <span
                                      className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                                        isLive ? "bg-ted-red text-white shadow-[0_0_12px_rgba(235,0,40,0.4)]" : "bg-white/10 text-white/50"
                                      }`}
                                    >
                                      TIER {phaseNumber}
                                    </span>
                                  </div>

                                  {isLive ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                      NOW LIVE
                                    </span>
                                  ) : isSoldOut ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs font-bold uppercase">
                                      SOLD OUT
                                    </span>
                                  ) : isClosed ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-mono text-xs font-bold uppercase">
                                      PAUSED
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-white/40 font-mono text-xs font-bold uppercase">
                                      UPCOMING
                                    </span>
                                  )}
                                </div>

                                {/* Dynamic Ticket Name (What admin gave) & Description */}
                                <div className="space-y-1.5">
                                  <h4
                                    className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${
                                      isLive
                                        ? "text-white group-hover:text-ted-red transition-colors duration-300"
                                        : isSoldOut
                                        ? "text-white/60"
                                        : "text-white/40"
                                    }`}
                                  >
                                    {tier.name}
                                  </h4>
                                  <p className="text-white/50 text-xs md:text-sm font-mono leading-relaxed">
                                    {tier.description || "All-Inclusive Admission • Kit & Meals Included"}
                                  </p>
                                </div>

                                {/* Price Presentation */}
                                <div className="pt-4 border-t border-white/10">
                                  <div className="flex items-baseline gap-2">
                                    <span
                                      className={`text-5xl md:text-6xl font-black font-mono tracking-tight ${
                                        isLive ? "text-white" : isSoldOut ? "text-white/40" : "text-white/30"
                                      }`}
                                    >
                                      ₹{tier.price}
                                    </span>
                                    <span className="text-xs text-white/40 font-mono uppercase tracking-wider">
                                      / pass
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action CTA Button */}
                              <div className="relative z-10 pt-8 mt-4">
                                {isLive ? (
                                  <button
                                    type="button"
                                    className="w-full py-4 px-6 bg-ted-red hover:bg-white text-white hover:text-black font-black rounded-2xl text-xs md:text-sm transition-all duration-300 uppercase tracking-[0.2em] font-mono flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(235,0,40,0.45)] group-hover:shadow-[0_0_40px_rgba(235,0,40,0.65)] cursor-pointer"
                                  >
                                    <span>Select {tier.name}</span>
                                    <svg
                                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                  </button>
                                ) : isSoldOut ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="w-full py-4 px-6 bg-white/5 border border-white/10 text-white/30 font-bold rounded-2xl text-xs uppercase tracking-wider font-mono flex items-center justify-center cursor-not-allowed"
                                  >
                                    <span>All Seats Allocated (Sold Out)</span>
                                  </button>
                                ) : isClosed ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="w-full py-4 px-6 bg-yellow-500/5 border border-yellow-500/20 text-yellow-400/50 font-bold rounded-2xl text-xs uppercase tracking-wider font-mono flex items-center justify-center cursor-not-allowed"
                                  >
                                    <span>Registrations Paused</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="w-full py-4 px-6 bg-white/5 border border-white/10 text-white/25 font-bold rounded-2xl text-xs uppercase tracking-wider font-mono flex items-center justify-center cursor-not-allowed"
                                  >
                                    <span>Next Phase</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Secondary Pass Retrieval Option */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => onTabChange("get-pass")}
                      className="text-xs font-mono text-white/50 hover:text-white underline underline-offset-4 tracking-wider uppercase transition-colors cursor-pointer"
                    >
                      Already Registered? Retrieve Your Pass Here →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ════════════════════════════════════════════════════════════════════
                  SCREEN 2: "BE IN THE ROOM WHERE IDEAS IGNITE" (From Screenshot)
                  ════════════════════════════════════════════════════════════════════ */}
              {step === "intro_pillars" && (
                <motion.div
                  key="intro_pillars"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="w-full bg-ted-dark-gray/50 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm relative overflow-hidden"
                >
                  {/* Decorative Glow */}
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-ted-red/10 blur-[80px] rounded-full" />

                  {/* Top Bar: Back to Tickets + Active Tier Tag */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6 relative z-10">
                    <button
                      type="button"
                      onClick={() => setStep("tier_card")}
                      className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span>Change Pass</span>
                    </button>
                    <span className="text-[11px] font-mono text-ted-red font-black uppercase tracking-wider">
                      Selected: {activeTier.name} (₹{activeTier.price})
                    </span>
                  </div>

                  <div className="relative z-10 space-y-10 py-2">
                    {/* Top Badge */}
                    <div className="flex justify-center">
                      {activeTier.status === "closed" ? (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px] uppercase tracking-[0.2em] font-black font-mono shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                          Registrations Paused
                        </span>
                      ) : activeTier.status === "sold_out" ? (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] uppercase tracking-[0.2em] font-black font-mono shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          All Passes Sold Out
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ted-red/10 border border-ted-red/20 text-ted-red text-[11px] uppercase tracking-[0.2em] font-black font-mono shadow-[0_0_15px_rgba(235,0,40,0.1)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-ted-red animate-pulse" />
                          Pass Application Open
                        </span>
                      )}
                    </div>

                    {/* Main Headline & Engaging Copy */}
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <h4 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight leading-tight text-white">
                        BE IN THE ROOM WHERE <br />
                        <span className="inline-block px-2 py-1 text-transparent bg-clip-text bg-gradient-to-r from-ted-red via-red-500 to-white">
                          IDEAS IGNITE
                        </span>
                      </h4>
                      <p className="text-white/75 text-sm md:text-base leading-relaxed font-light">
                        TEDxGCEM {getEventYear(settings?.event_date)} is more than a stage. It&apos;s a convergence of visionaries, catalysts, and innovators pushing the boundaries of what is possible. Join us for a day filled with mind-expanding talks, electrifying performances, and networking opportunities that could redefine your trajectory.
                      </p>
                    </div>

                    {/* Highlight Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
                      {[
                        {
                          num: "01",
                          title: "Inspiring Talks",
                          desc: "8+ select speakers sharing game-changing insights.",
                        },
                        {
                          num: "02",
                          title: "Curated Kits",
                          desc: "Official TEDx badge, certificate, and exclusive event goodies.",
                        },
                        {
                          num: "03",
                          title: "Elite Network",
                          desc: "Connect directly with mentors, professionals, and peers.",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="relative bg-black/30 border border-white/5 p-6 rounded-2xl text-left backdrop-blur-md group hover:border-ted-red/30 hover:bg-ted-red/[0.02] transition-all duration-300"
                        >
                          <span className="absolute top-4 right-4 text-[10px] font-mono text-white/20 group-hover:text-ted-red/40 transition-colors font-bold">
                            {item.num}
                          </span>
                          <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-1.5 group-hover:text-ted-red transition-colors">
                            {item.title}
                          </h5>
                          <p className="text-white/50 text-[12px] leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col items-center gap-4 pt-4">
                      {activeTier.status === "closed" ? (
                        <button
                          type="button"
                          disabled
                          className="px-10 py-5 bg-white/10 text-white/40 font-black rounded-2xl text-base uppercase tracking-[0.15em] cursor-not-allowed border border-white/10"
                        >
                          <span>Registrations Temporarily Paused</span>
                        </button>
                      ) : activeTier.status === "sold_out" ? (
                        <button
                          type="button"
                          disabled
                          className="px-10 py-5 bg-white/10 text-white/40 font-black rounded-2xl text-base uppercase tracking-[0.15em] cursor-not-allowed border border-white/10"
                        >
                          <span>All Tickets Sold Out</span>
                        </button>
                      ) : !user ? (
                        <button
                          onClick={loginWithGoogle}
                          className="group relative px-10 py-5 bg-white text-black font-black rounded-2xl text-base shadow-lg hover:bg-ted-red hover:text-white transition-all duration-300 uppercase tracking-[0.15em] flex items-center gap-3 cursor-pointer"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                          <span>Sign In with Google to Register</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setStep("form")}
                          className="group relative px-10 py-5 bg-ted-red text-white font-black rounded-2xl text-base shadow-[0_0_25px_rgba(235,0,40,0.35)] hover:shadow-[0_0_35px_rgba(235,0,40,0.55)] hover:bg-white hover:text-ted-red transition-all duration-300 uppercase tracking-[0.15em] flex items-center gap-3 cursor-pointer"
                        >
                          <span>Request Attendee Pass</span>
                          <svg
                            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => onTabChange("get-pass")}
                        className="group relative mt-2 px-8 py-3.5 bg-transparent border border-white/10 hover:border-ted-red text-white/70 hover:text-white font-mono uppercase tracking-widest text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:bg-ted-red/5"
                      >
                        <span>Get My Pass</span>
                        <svg
                          className="w-4 h-4 text-white/50 group-hover:text-white transition-colors duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      
                      {activeTier.status === "closed" ? (
                        <span className="text-[10px] text-yellow-400/80 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                          PAUSED BY ORGANIZERS
                        </span>
                      ) : activeTier.status === "sold_out" ? (
                        <span className="text-[10px] text-red-400 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          SOLD OUT
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                          LIVE NOW
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ════════════════════════════════════════════════════════════════════
                  SCREEN 3: ATTENDEE FORM + COUPON APPLICATION + RAZORPAY CHECKOUT
                  ════════════════════════════════════════════════════════════════════ */}
              {step === "form" && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  onSubmit={handleSubmitAndPay}
                  className="w-full bg-ted-dark-gray/50 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm relative overflow-hidden space-y-8"
                >
                  {/* Form Top Navigation Bar */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setStep("intro_pillars")}
                      className="group flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-all cursor-pointer font-bold font-mono"
                    >
                      <svg
                        className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span>Back</span>
                    </button>
                    <div className="flex items-center gap-3 overflow-hidden max-w-[60%]">
                      <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 shrink-0">Logged in:</span>
                      <span className="text-[9px] uppercase tracking-widest font-mono text-white font-bold truncate">{user?.email}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-mono text-ted-red font-black shrink-0">
                      Step 2 of 2: Details
                    </span>
                  </div>

                  {/* Tier Banner Box */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-ted-red/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-ted-red/20 border border-ted-red/30 flex items-center justify-center text-ted-red font-mono font-black">
                        🎟️
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm uppercase tracking-wider">{activeTier.name} Pass</div>
                        <div className="text-white/50 text-xs">Official delegate registration pass for TEDxGCEM 2026</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <span className="text-xs text-white/40">Tier Price: </span>
                      <span className="text-lg font-black text-white">₹{activeTier.price}.00</span>
                    </div>
                  </div>

                  {/* Attendee Form Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                        Full Name <span className="text-ted-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full bg-black/40 border ${errors.fullName ? "border-red-500" : "border-white/10 focus:border-ted-red"} rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors`}
                      />
                      {errors.fullName && <p className="text-[11px] text-red-500 font-mono">{errors.fullName}</p>}
                    </div>

                    {/* Email (Read Only from Google) */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                        Email Address (Google Account)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly
                        disabled
                        className="w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/60 cursor-not-allowed font-mono"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                        Phone Number <span className="text-ted-red">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className={`w-full bg-black/40 border ${errors.phone ? "border-red-500" : "border-white/10 focus:border-ted-red"} rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors`}
                      />
                      {errors.phone && <p className="text-[11px] text-red-500 font-mono">{errors.phone}</p>}
                    </div>

                    {/* Designation */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                        Role / Designation <span className="text-ted-red">*</span>
                      </label>
                      <select
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 focus:border-ted-red rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                      >
                        <option value="Student" className="bg-zinc-900 text-white">Student</option>
                        <option value="Faculty / Professor" className="bg-zinc-900 text-white">Faculty / Professor</option>
                        <option value="Working Professional" className="bg-zinc-900 text-white">Working Professional</option>
                        <option value="Entrepreneur / Founder" className="bg-zinc-900 text-white">Entrepreneur / Founder</option>
                        <option value="Researcher" className="bg-zinc-900 text-white">Researcher</option>
                        <option value="Other" className="bg-zinc-900 text-white">Other</option>
                      </select>
                    </div>

                    {/* Organization / College */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                        College / University / Company <span className="text-ted-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="Gopalan College of Engineering and Management"
                        className={`w-full bg-black/40 border ${errors.organization ? "border-red-500" : "border-white/10 focus:border-ted-red"} rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors`}
                      />
                      {errors.organization && <p className="text-[11px] text-red-500 font-mono">{errors.organization}</p>}
                    </div>

                    {/* LinkedIn URL */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                        LinkedIn Profile (Optional)
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className={`w-full bg-black/40 border ${errors.linkedin ? "border-red-500" : "border-white/10 focus:border-ted-red"} rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors`}
                      />
                      {errors.linkedin && <p className="text-[11px] text-red-500 font-mono">{errors.linkedin}</p>}
                    </div>

                    {/* Referral Source */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                        How Did You Hear About Us? (Optional)
                      </label>
                      <input
                        type="text"
                        name="referral"
                        value={formData.referral}
                        onChange={handleChange}
                        placeholder="Instagram, College Notice, Friend, etc."
                        className="w-full bg-black/40 border border-white/10 focus:border-ted-red rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* ════════════════════════════════════════════════════════════════
                      PROMO / COUPON CODE SECTION (Only for phases allowing coupons)
                      ════════════════════════════════════════════════════════════════ */}
                  {activeTier.allow_coupons ? (
                    <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase tracking-widest text-white/80 font-bold flex items-center gap-2">
                          <span>🎟️ Have a Promo / Coupon Code?</span>
                        </label>
                        <span className="text-[10px] font-mono text-white/40">10-min promo codes supported</span>
                      </div>

                      {!appliedCoupon ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase());
                              if (couponError) setCouponError(null);
                            }}
                            placeholder="Enter Promo Code (e.g. TEDX-84N2K)"
                            className="flex-1 bg-black/50 border border-white/15 focus:border-ted-red rounded-xl px-4 py-2.5 text-xs text-white uppercase placeholder:text-white/20 font-mono focus:outline-none tracking-wider"
                          />
                          <button
                            type="button"
                            disabled={couponValidating || !couponInput.trim()}
                            onClick={handleApplyCoupon}
                            className="px-6 py-2.5 bg-white hover:bg-ted-red text-black hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black font-black rounded-xl text-xs font-mono uppercase tracking-widest transition-all cursor-pointer shrink-0"
                          >
                            {couponValidating ? "Checking..." : "Apply Code"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-mono font-bold text-green-400">
                              PROMO APPLIED: <strong className="text-white uppercase tracking-wider">{appliedCoupon.code}</strong> — Save ₹{appliedCoupon.discountAmount}.00 ({appliedCoupon.discountPercentage}% OFF)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-xs font-mono text-red-400 hover:text-red-300 underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      {couponError && (
                        <p className="text-[11px] text-red-400 font-mono">{couponError}</p>
                      )}
                    </div>
                  ) : null}

                  {/* ════════════════════════════════════════════════════════════════
                      ORDER SUMMARY & AMOUNT BREAKDOWN
                      ════════════════════════════════════════════════════════════════ */}
                  <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between text-white/60">
                      <span>Standard {activeTier.name} Pass:</span>
                      <span className={appliedCoupon ? "line-through text-white/40" : "text-white"}>
                        ₹{activeTier.price}.00
                      </span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-green-400 font-bold">
                        <span>Promo Code Discount ({appliedCoupon.code}):</span>
                        <span>-₹{appliedCoupon.discountAmount}.00</span>
                      </div>
                    )}

                    <div className="border-t border-white/10 pt-2 flex justify-between items-baseline text-sm">
                      <span className="font-bold text-white uppercase tracking-wider">Total Amount to Pay:</span>
                      <span className="text-xl font-black text-ted-red">
                        ₹{payablePrice}.00
                      </span>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {errors.submit && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-3">
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errors.submit}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-ted-red hover:bg-white text-white hover:text-black font-black rounded-2xl text-sm transition-all duration-300 uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(235,0,40,0.35)] cursor-pointer disabled:opacity-50 font-mono"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Initiating Secure Checkout...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay ₹{payablePrice}.00 & Confirm Registration</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-white/40 text-center font-mono mt-3">
                      🔒 256-Bit Encrypted Razorpay Gateway • HMAC-SHA256 Cryptographic Verification
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </div>
      )}
    </section>
  );
}
