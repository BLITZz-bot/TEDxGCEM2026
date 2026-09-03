"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabId } from "@/components/ui/TabNav";
import { useAuth } from "@/hooks/useAuth";
import { EventSettings } from "@/lib/settings-service";
import { getEventYear } from "@/lib/utils";

import UpiLaptopModal from "@/components/ui/UpiLaptopModal";
import UpiMobilePaymentModal from "@/components/ui/UpiMobilePaymentModal";

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

interface AttendeeData {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  linkedin: string;
  referral: string;
}

export default function RegisterNow({ onTabChange, settings }: RegisterNowProps) {
  const { user, loading, loginWithGoogle } = useAuth();
  
  // Navigation Steps:
  // "tier_card" (Screen 1: Beautiful Active Ticket Showcase)
  // "intro_pillars" (Screen 2: "Be in the Room Where Ideas Ignite" with 3 pillars from screenshot)
  // "form" (Screen 3: Registration Form + Coupon + Direct UPI Payment)
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

  // Multi-Ticket Quantity & Attendees state
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [activeAttendeeIndex, setActiveAttendeeIndex] = useState<number>(0);
  const [attendees, setAttendees] = useState<AttendeeData[]>([
    {
      fullName: "",
      email: "",
      phone: "",
      organization: "",
      designation: "Student",
      linkedin: "",
      referral: "",
    },
  ]);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(null);
  const [isCouponExpanded, setIsCouponExpanded] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | null>(null);
  const [confirmedCount, setConfirmedCount] = useState<number>(1);

  // Direct UPI & Cross-Device Handoff Modals State
  const [laptopModalOpen, setLaptopModalOpen] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState("");
  const [activeAuthToken, setActiveAuthToken] = useState("");
  // True only when the modal is opened via session-restore (page reload after GPay/PhonePe app-switch)
  const [restoreUpiSession, setRestoreUpiSession] = useState(false);

  const [restoredNotification, setRestoredNotification] = useState(false);

  // Check for cross-device mobile handoff draft_id in URL params OR restore local draft on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const draftIdParam = params.get("draft_id");
    const tokenParam = params.get("token");

    if (draftIdParam) {
      fetch(`/api/register/verify-handoff?draft_id=${draftIdParam}${tokenParam ? `&token=${tokenParam}` : ""}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((res) => {
          if (res?.success && res.data) {
            const d = res.data;
            setActiveDraftId(draftIdParam);
            if (d.attendees && Array.isArray(d.attendees) && d.attendees.length > 0) {
              setAttendees(d.attendees);
              setTicketQuantity(d.quantity || d.attendees.length);
            } else {
              setAttendees([
                {
                  fullName: d.fullName || "",
                  email: d.email || "",
                  phone: d.phone || "",
                  organization: d.organization || "",
                  designation: d.designation || "Student",
                  linkedin: d.linkedin || "",
                  referral: d.referral || "",
                },
              ]);
              setTicketQuantity(d.quantity || 1);
            }
            if (d.tierId && d.tierName) {
              setActiveTier((prev) => ({
                ...prev,
                id: d.tierId,
                name: d.tierName,
                price: d.amount ? (d.amount + (d.discountAmount || 0)) / (d.quantity || 1) : prev.price,
              }));
            }
            if (d.couponCode) {
              setAppliedCoupon({
                code: d.couponCode,
                originalPrice: d.amount + (d.discountAmount || 0),
                discountAmount: d.discountAmount || 0,
                finalAmount: d.amount,
                discountPercentage: 0,
              });
            }
            setStep("form");
            setMobileModalOpen(true);
          }
        })
        .catch((err) => console.warn("Handoff verification error:", err));
    } else {
      // 1. Restore local in-progress draft if exists within 24h
      try {
        const saved = localStorage.getItem("tedx_local_draft_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          const isFresh = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
          if (isFresh && Array.isArray(parsed.attendees) && parsed.attendees.length > 0 && parsed.attendees[0]?.fullName) {
            setTimeout(() => {
              setAttendees(parsed.attendees);
              if (parsed.ticketQuantity) setTicketQuantity(parsed.ticketQuantity);
              if (parsed.appliedCoupon) setAppliedCoupon(parsed.appliedCoupon);
              setRestoredNotification(true);
            }, 0);
          }
        }
      } catch {
        // ignore localStorage error
      }

      // 2. Check if user is returning from UPI payment app (via upi_return param or active sessionStorage)
      try {
        const upiReturnParam = params.get("upi_return");
        const activeUpi = sessionStorage.getItem("tedx_active_upi_session");
        if (activeUpi || upiReturnParam) {
          const parsedUpi = activeUpi ? JSON.parse(activeUpi) : null;
          const isFresh = parsedUpi ? Date.now() - parsedUpi.timestamp < 30 * 60 * 1000 : true;
          if (isFresh) {
            setTimeout(() => {
              setStep("form");
              if (parsedUpi?.draftId) setActiveDraftId(parsedUpi.draftId);
              setRestoreUpiSession(true);
              setMobileModalOpen(true);
            }, 50);
          }
        }
      } catch {}
    }
  }, []);

  // Auto-save form draft changes to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || isSuccess) return;
    try {
      if (attendees.some((a) => a.fullName || a.phone || a.organization)) {
        localStorage.setItem(
          "tedx_local_draft_v1",
          JSON.stringify({
            attendees,
            ticketQuantity,
            appliedCoupon,
            timestamp: Date.now(),
          })
        );
      }
    } catch {
      // ignore
    }
  }, [attendees, ticketQuantity, appliedCoupon, isSuccess]);

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

  // Autofill user credentials for primary attendee when auth state loads
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        setAttendees((prev) => {
          const copy = [...prev];
          if (copy.length > 0) {
            copy[0] = {
              ...copy[0],
              email: user.email || copy[0].email,
              fullName: user.user_metadata?.full_name || copy[0].fullName,
            };
          }
          return copy;
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  // Handle ticket quantity changes
  const handleQuantityChange = (newQty: number) => {
    const clamped = Math.max(1, Math.min(10, newQty));
    setTicketQuantity(clamped);

    // Strict rule: promo codes are for single ticket only
    if (clamped > 1 && appliedCoupon) {
      setAppliedCoupon(null);
      setCouponInput("");
      setCouponError(null);
      setIsCouponExpanded(false);
    }

    setAttendees((prev) => {
      const copy = [...prev];
      if (clamped > copy.length) {
        for (let i = copy.length; i < clamped; i++) {
          copy.push({
            fullName: "",
            email: "",
            phone: "",
            organization: copy[0]?.organization || "",
            designation: "Student",
            linkedin: "",
            referral: copy[0]?.referral || "",
          });
        }
      } else if (clamped < copy.length) {
        copy.splice(clamped);
      }
      return copy;
    });

    if (activeAttendeeIndex >= clamped) {
      setActiveAttendeeIndex(clamped - 1);
    }
  };

  const handleAttendeeChange = (index: number, field: keyof AttendeeData, value: string) => {
    setAttendees((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      // If purchaser (Delegate 1) updates referral, auto-populate across all other delegates
      if (index === 0 && field === "referral") {
        for (let j = 1; j < copy.length; j++) {
          copy[j] = { ...copy[j], referral: value };
        }
      }
      return copy;
    });

    const errKey = `att_${index}_${field}`;
    if (errors[errKey]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[errKey];
        if (index === 0 && field === "referral") {
          for (let j = 1; j < ticketQuantity; j++) {
            delete copy[`att_${j}_referral`];
          }
        }
        return copy;
      });
    }
  };

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
    if (ticketQuantity > 1) {
      setCouponError("Promo codes can only be applied to single delegate passes (1 ticket).");
      return;
    }

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
    let firstInvalidIndex = -1;

    for (let i = 0; i < ticketQuantity; i++) {
      const att = attendees[i] || {
        fullName: "",
        email: "",
        phone: "",
        organization: "",
        designation: "Student",
        linkedin: "",
        referral: "",
      };

      if (!att.fullName.trim()) {
        newErrors[`att_${i}_fullName`] = `Delegate #${i + 1} full name is required`;
        if (firstInvalidIndex === -1) firstInvalidIndex = i;
      }

      if (!att.email.trim()) {
        newErrors[`att_${i}_email`] = `Delegate #${i + 1} email address is required`;
        if (firstInvalidIndex === -1) firstInvalidIndex = i;
      } else if (!/\S+@\S+\.\S+/.test(att.email.trim())) {
        newErrors[`att_${i}_email`] = "Please enter a valid email address";
        if (firstInvalidIndex === -1) firstInvalidIndex = i;
      }

      if (!att.phone.trim()) {
        newErrors[`att_${i}_phone`] = `Delegate #${i + 1} phone number is required`;
        if (firstInvalidIndex === -1) firstInvalidIndex = i;
      } else if (!/^\+?[\d\s-]{10,14}$/.test(att.phone.trim())) {
        newErrors[`att_${i}_phone`] = "Please enter a valid 10-digit phone number";
        if (firstInvalidIndex === -1) firstInvalidIndex = i;
      }

      if (!att.organization.trim()) {
        newErrors[`att_${i}_organization`] = `Delegate #${i + 1} college / organization is required`;
        if (firstInvalidIndex === -1) firstInvalidIndex = i;
      }

      if (!att.designation.trim()) {
        newErrors[`att_${i}_designation`] = `Delegate #${i + 1} designation is required`;
        if (firstInvalidIndex === -1) firstInvalidIndex = i;
      }

      if (!att.referral.trim()) {
        newErrors[`att_${i}_referral`] = `Delegate #${i + 1}: Please tell us how you heard about us`;
        if (firstInvalidIndex === -1) firstInvalidIndex = i;
      }

      if (att.linkedin.trim() && !/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i.test(att.linkedin.trim())) {
        newErrors[`att_${i}_linkedin`] = "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)";
        if (firstInvalidIndex === -1) firstInvalidIndex = i;
      }
    }

    if (firstInvalidIndex !== -1 && firstInvalidIndex !== activeAttendeeIndex) {
      setActiveAttendeeIndex(firstInvalidIndex);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const activeAttendees = attendees.slice(0, ticketQuantity);

      // 1. Create server-side registration draft
      const draftRes = await fetch("/api/register/create-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: activeAttendees[0].fullName,
          email: activeAttendees[0].email || user.email,
          phone: activeAttendees[0].phone,
          organization: activeAttendees[0].organization,
          designation: activeAttendees[0].designation,
          linkedin: activeAttendees[0].linkedin,
          referral: activeAttendees[0].referral,
          tierId: activeTier.id,
          tierName: activeTier.name,
          quantity: ticketQuantity,
          amount: payablePrice,
          couponCode: (ticketQuantity === 1 && appliedCoupon) ? appliedCoupon.code : null,
          discountAmount: (ticketQuantity === 1 && appliedCoupon) ? appliedCoupon.discountAmount : 0,
          attendees: activeAttendees,
        }),
      });

      const draftData = await draftRes.json();
      if (!draftRes.ok) {
        throw new Error(draftData.error || "Failed to create payment session draft.");
      }

      setActiveDraftId(draftData.draftId);
      setActiveAuthToken(draftData.authToken || "");

      // 2. Open Laptop Split Modal or Mobile Payment Modal based on device viewport
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      if (isMobile) {
        setMobileModalOpen(true);
      } else {
        setLaptopModalOpen(true);
      }
    } catch (err: unknown) {
      console.error("Error initiating payment:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to initiate payment. Please try again.";
      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute final display price in form
  const baseOrderPrice = activeTier.price * ticketQuantity;
  const couponDiscountAmount = (ticketQuantity === 1 && appliedCoupon) ? appliedCoupon.discountAmount : 0;
  const payablePrice = Math.max(0, baseOrderPrice - couponDiscountAmount);

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
        <div className="h-[1.5px] w-20 bg-ted-red" />
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
              className="w-full bg-ted-dark-gray/50 border border-amber-500/30 p-8 md:p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm text-center space-y-6 relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <span className="text-4xl animate-bounce">⏳</span>
              </div>
              <div className="space-y-3">
                <span className="inline-block px-3.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-black uppercase tracking-widest rounded-full">
                  Payment Received · Under Verification
                </span>
                <h4 className="text-3xl font-black uppercase tracking-tight text-white">
                  Registration Details Submitted!
                </h4>
                <p className="text-white/70 max-w-xl mx-auto text-sm leading-relaxed font-light">
                  Thank you for registering for <strong className="text-ted-red font-bold">TEDxGCEM {getEventYear(settings?.event_date)}</strong>. We have received your payment proof for <strong className="text-white font-semibold">{confirmedCount} × {activeTier.name} Delegate Pass{confirmedCount > 1 ? "es" : ""}</strong>.
                </p>

                {verifiedPaymentId && (
                  <div className="inline-block px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white/60">
                    Payment Reference: <span className="text-amber-400 font-bold tracking-wider">{verifiedPaymentId}</span>
                  </div>
                )}
              </div>

              {/* What happens next explainer card */}
              <div className="max-w-lg mx-auto text-left p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2.5 font-mono text-xs">
                <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <span>ℹ️</span> What Happens Next?
                </div>
                <ul className="space-y-2 text-white/70 text-[11px] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">1.</span>
                    <span>The TEDxGCEM team will verify your transaction against bank records.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">2.</span>
                    <span>Once verified, your official <strong>Delegate Pass with unique QR code</strong> will be generated and dispatched to your email.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">3.</span>
                    <span>A verification receipt email has been sent to your inbox.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => onTabChange("home")}
                  className="px-8 py-4 bg-ted-red hover:bg-white text-white hover:text-black font-black rounded-xl text-xs transition-all uppercase tracking-widest cursor-pointer border border-ted-red shadow-[0_0_20px_rgba(235,0,40,0.3)] font-mono flex items-center gap-2"
                >
                  <span>Return to Home</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <a
                  href="mailto:tedxgcem@gmail.com"
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-xl text-xs transition-all uppercase tracking-widest cursor-pointer border border-white/10 font-mono"
                >
                  Contact Support
                </a>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {/* ════════════════════════════════════════════════════════════════════
                  SCREEN 1: BEAUTIFUL TICKET SHOWCASE CARD
                  ════════════════════════════════════════════════════════════════════ */}
              {step === "tier_card" && (
                <motion.div
                  key="tier_card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full space-y-8"
                >
                  {/* Top Notification Tag */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/60">
                      <span className="w-2 h-2 rounded-full bg-ted-red animate-pulse" />
                      <span>Official Delegate Releases</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                      Stage 01 of 02
                    </span>
                  </div>

                  {/* Public Ticket Cards Grid */}
                  {(() => {
                    const visibleTiers = allPublicTiers.filter(
                      (t) => t.status === "active" || t.status === "sold_out" || t.status === "closed"
                    );
                    const displayTiers = visibleTiers.length > 0 ? visibleTiers : [activeTier];

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
                                    <span>Releasing Soon</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              {/* ════════════════════════════════════════════════════════════════════
                  SCREEN 2: INTRO PILLARS ("BE IN THE ROOM WHERE IDEAS IGNITE")
                  ════════════════════════════════════════════════════════════════════ */}
              {step === "intro_pillars" && (
                <motion.div
                  key="intro_pillars"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full space-y-12"
                >
                  {/* Top Bar with Back Button and Active Tier Name */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <button
                      type="button"
                      onClick={() => setStep("tier_card")}
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
                      <span>Change Pass Tier</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-ted-red font-black">
                        Selected: {activeTier.name} (₹{activeTier.price})
                      </span>
                    </div>
                  </div>

                  {/* Header Title & Subtitle */}
                  <div className="space-y-4 text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ted-red/10 border border-ted-red/20 text-ted-red text-[11px] font-mono font-bold uppercase tracking-widest">
                      <span>✦ Exclusive Access Pass</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                      Be in the Room Where <br />
                      <span className="text-ted-red italic">Ideas Ignite.</span>
                    </h3>
                    <p className="text-white/60 text-xs md:text-sm leading-relaxed font-sans font-light">
                      One day. Visionary speakers. World-class networking. Your seat is waiting at TEDxGCEM {getEventYear(settings?.event_date)}.
                    </p>
                  </div>

                  {/* 3 Pillars Showcase Container */}
                  <div className="w-full bg-[#0d0d12] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden space-y-10">
                    {/* Background Subtle Gradient */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-ted-red/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                      {[
                        {
                          num: "01",
                          title: "World-Class Talks",
                          desc: "Live, unfiltered presentations from thought leaders reshaping technology, culture, and social innovation.",
                        },
                        {
                          num: "02",
                          title: "Curated Kit & Meals",
                          desc: "Official TEDxGCEM delegate badge, premium event package, and curated dining experiences throughout the day.",
                        },
                        {
                          num: "03",
                          title: "Elite Networking",
                          desc: "Direct access to fellow changemakers, speakers, industry pioneers, and visionary entrepreneurs.",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="group relative p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-ted-red/40 transition-all duration-300 flex flex-col justify-start"
                        >
                          <span className="text-xs font-mono font-black text-ted-red mb-3 block">
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

                    {/* CTA Area */}
                    <div className="flex justify-center pt-4 relative z-10">
                      {!user ? (
                        <button
                          onClick={loginWithGoogle}
                          className="px-10 py-5 bg-white text-black hover:bg-ted-red hover:text-white font-black rounded-2xl text-sm uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(235,0,40,0.3)]"
                        >
                          Sign In With Google to Register
                        </button>
                      ) : (
                        <button
                          onClick={() => setStep("form")}
                          className="px-10 py-5 bg-ted-red text-white hover:bg-white hover:text-black font-black rounded-2xl text-sm uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:shadow-none"
                        >
                          Proceed to Registration
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ════════════════════════════════════════════════════════════════
                  SCREEN 3: ATTENDEE FORM + QUANTITY + DIRECT UPI PAYMENT
                  ════════════════════════════════════════════════════════════════ */}
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

                  {/* Auto-Restored Session Banner */}
                  {restoredNotification && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-400"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">👋</span>
                        <span>
                          <strong>Welcome back!</strong> We restored your in-progress delegate details.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRestoredNotification(false)}
                        className="text-[10px] text-white/50 hover:text-white underline cursor-pointer shrink-0 ml-3"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  )}

                  {/* Tier Banner Box & Quantity Selector */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-ted-red/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-xl bg-ted-red/20 border border-ted-red/30 flex items-center justify-center text-ted-red font-mono font-black text-xl shrink-0">
                        🎟️
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm uppercase tracking-wider">{activeTier.name} Pass</div>
                        <div className="text-white/50 text-xs font-mono">₹{activeTier.price}.00 per delegate pass</div>
                      </div>
                    </div>

                    {/* Ticket Quantity Selector */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto bg-black/60 px-4 py-2.5 rounded-xl border border-white/10">
                      <span className="text-xs font-mono uppercase tracking-wider text-white/60">Tickets:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ticketQuantity - 1)}
                          disabled={ticketQuantity <= 1}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-ted-red text-white disabled:opacity-30 disabled:hover:bg-white/5 flex items-center justify-center font-bold text-base transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-mono font-black text-white text-base">
                          {ticketQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ticketQuantity + 1)}
                          disabled={ticketQuantity >= 10}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-ted-red text-white disabled:opacity-30 disabled:hover:bg-white/5 flex items-center justify-center font-bold text-base transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Attendee Delegate Selector Tabs */}
                  {ticketQuantity > 1 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase tracking-widest text-white/70 font-bold flex items-center gap-2">
                          <span>👥 Participant Details ({ticketQuantity} Total Passes)</span>
                        </label>
                        <span className="text-[10px] font-mono text-ted-red font-bold">
                          Filling: Delegate #{activeAttendeeIndex + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {attendees.slice(0, ticketQuantity).map((att, idx) => {
                          const isSelected = activeAttendeeIndex === idx;
                          const isComplete = !!(att.fullName.trim() && att.phone.trim() && att.organization.trim());
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveAttendeeIndex(idx)}
                              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                                isSelected
                                  ? "bg-ted-red text-white shadow-[0_0_15px_rgba(235,0,40,0.4)]"
                                  : "bg-black/40 hover:bg-white/10 text-white/70 border border-white/10"
                              }`}
                            >
                              <span>{idx === 0 ? "👤 You (Delegate 1)" : `👤 Delegate ${idx + 1}`}</span>
                              {isComplete && (
                                <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-emerald-400"}`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Attendee Form Input Fields for currently selected delegate */}
                  {(() => {
                    const currentAtt = attendees[activeAttendeeIndex] || {
                      fullName: "",
                      email: "",
                      phone: "",
                      organization: "",
                      designation: "Student",
                      linkedin: "",
                      referral: "",
                    };

                    return (
                      <div className="space-y-6 bg-black/25 p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span>{activeAttendeeIndex === 0 ? "Primary Delegate (Pass #1)" : `Delegate #${activeAttendeeIndex + 1} Pass Details`}</span>
                          </div>
                          {ticketQuantity > 1 && (
                            <span className="text-[10px] font-mono text-white/40">
                              Participant {activeAttendeeIndex + 1} of {ticketQuantity}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Full Name */}
                          <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                              Full Name <span className="text-ted-red">*</span>
                            </label>
                            <input
                              type="text"
                              value={currentAtt.fullName}
                              onChange={(e) => handleAttendeeChange(activeAttendeeIndex, "fullName", e.target.value)}
                              placeholder={activeAttendeeIndex === 0 ? "John Doe" : "Participant Full Name"}
                              className={`w-full bg-black/40 border ${errors[`att_${activeAttendeeIndex}_fullName`] ? "border-red-500" : "border-white/10 focus:border-ted-red"} rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors`}
                            />
                            {errors[`att_${activeAttendeeIndex}_fullName`] && (
                              <p className="text-[11px] text-red-500 font-mono">{errors[`att_${activeAttendeeIndex}_fullName`]}</p>
                            )}
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                              Email Address <span className="text-ted-red">*</span>{" "}
                              {activeAttendeeIndex === 0 && (
                                <span className="text-[10px] text-white/40 font-normal lowercase">(google account)</span>
                              )}
                            </label>
                            <input
                              type="email"
                              value={currentAtt.email}
                              onChange={(e) => handleAttendeeChange(activeAttendeeIndex, "email", e.target.value)}
                              readOnly={activeAttendeeIndex === 0}
                              disabled={activeAttendeeIndex === 0}
                              placeholder="delegate@example.com"
                              className={`w-full ${activeAttendeeIndex === 0 ? "bg-black/60 border border-white/5 text-white/60 cursor-not-allowed" : `bg-black/40 border ${errors[`att_${activeAttendeeIndex}_email`] ? "border-red-500" : "border-white/10 focus:border-ted-red"} text-white`} rounded-xl px-4 py-3 text-sm placeholder:text-white/20 font-mono focus:outline-none transition-colors`}
                            />
                            {errors[`att_${activeAttendeeIndex}_email`] && (
                              <p className="text-[11px] text-red-500 font-mono">{errors[`att_${activeAttendeeIndex}_email`]}</p>
                            )}
                          </div>

                          {/* Phone Number */}
                          <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                              Phone Number <span className="text-ted-red">*</span>
                            </label>
                            <input
                              type="tel"
                              value={currentAtt.phone}
                              onChange={(e) => handleAttendeeChange(activeAttendeeIndex, "phone", e.target.value)}
                              placeholder="+91 98765 43210"
                              className={`w-full bg-black/40 border ${errors[`att_${activeAttendeeIndex}_phone`] ? "border-red-500" : "border-white/10 focus:border-ted-red"} rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors`}
                            />
                            {errors[`att_${activeAttendeeIndex}_phone`] && (
                              <p className="text-[11px] text-red-500 font-mono">{errors[`att_${activeAttendeeIndex}_phone`]}</p>
                            )}
                          </div>

                          {/* Designation */}
                          <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                              Role / Designation <span className="text-ted-red">*</span>
                            </label>
                            <select
                              value={currentAtt.designation}
                              onChange={(e) => handleAttendeeChange(activeAttendeeIndex, "designation", e.target.value)}
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
                              value={currentAtt.organization}
                              onChange={(e) => handleAttendeeChange(activeAttendeeIndex, "organization", e.target.value)}
                              placeholder="Gopalan College of Engineering and Management"
                              className={`w-full bg-black/40 border ${errors[`att_${activeAttendeeIndex}_organization`] ? "border-red-500" : "border-white/10 focus:border-ted-red"} rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors`}
                            />
                            {errors[`att_${activeAttendeeIndex}_organization`] && (
                              <p className="text-[11px] text-red-500 font-mono">{errors[`att_${activeAttendeeIndex}_organization`]}</p>
                            )}
                          </div>

                          {/* LinkedIn URL */}
                          <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                              LinkedIn Profile (Optional)
                            </label>
                            <input
                              type="url"
                              value={currentAtt.linkedin}
                              onChange={(e) => handleAttendeeChange(activeAttendeeIndex, "linkedin", e.target.value)}
                              placeholder="https://linkedin.com/in/username"
                              className={`w-full bg-black/40 border ${errors[`att_${activeAttendeeIndex}_linkedin`] ? "border-red-500" : "border-white/10 focus:border-ted-red"} rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors`}
                            />
                            {errors[`att_${activeAttendeeIndex}_linkedin`] && (
                              <p className="text-[11px] text-red-500 font-mono">{errors[`att_${activeAttendeeIndex}_linkedin`]}</p>
                            )}
                          </div>

                          {/* Referral Source */}
                          <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-white/70 block">
                              How Did You Hear About Us? <span className="text-ted-red">*</span>
                            </label>
                            <input
                              type="text"
                              value={currentAtt.referral}
                              onChange={(e) => handleAttendeeChange(activeAttendeeIndex, "referral", e.target.value)}
                              placeholder="Instagram, College Notice, Friend, etc."
                              className={`w-full bg-black/40 border ${errors[`att_${activeAttendeeIndex}_referral`] ? "border-red-500" : "border-white/10 focus:border-ted-red"} rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors`}
                            />
                            {errors[`att_${activeAttendeeIndex}_referral`] && (
                              <p className="text-[11px] text-red-500 font-mono">{errors[`att_${activeAttendeeIndex}_referral`]}</p>
                            )}
                          </div>
                        </div>

                        {/* Multi-Attendee Navigation Buttons */}
                        {ticketQuantity > 1 && (
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <button
                              type="button"
                              disabled={activeAttendeeIndex === 0}
                              onClick={() => setActiveAttendeeIndex((prev) => Math.max(0, prev - 1))}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono font-bold rounded-lg uppercase tracking-wider transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            >
                              ← Previous Delegate
                            </button>
                            <button
                              type="button"
                              disabled={activeAttendeeIndex === ticketQuantity - 1}
                              onClick={() => setActiveAttendeeIndex((prev) => Math.min(ticketQuantity - 1, prev + 1))}
                              className="px-4 py-2 bg-ted-red/20 hover:bg-ted-red text-ted-red hover:text-white border border-ted-red/30 text-xs font-mono font-bold rounded-lg uppercase tracking-wider transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            >
                              Next Delegate →
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ════════════════════════════════════════════════════════════════
                      PROMO / COUPON CODE SECTION (Disabled for multiple tickets)
                      ════════════════════════════════════════════════════════════════ */}
                  {ticketQuantity > 1 ? (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                      <span className="text-sm">🎟️</span>
                      <p className="text-[11px] font-mono text-white/50">
                        Promo discount codes are valid only for <strong className="text-white">individual single-ticket registrations (1 ticket)</strong>. Group registrations are processed at the standard tier rate.
                      </p>
                    </div>
                  ) : activeTier.allow_coupons ? (
                    <div className="rounded-2xl bg-black/30 border border-white/10 overflow-hidden transition-all duration-200">
                      {!isCouponExpanded && !appliedCoupon ? (
                        <button
                          type="button"
                          onClick={() => setIsCouponExpanded(true)}
                          className="w-full p-4 flex items-center justify-between text-left cursor-pointer group hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="text-xs font-mono uppercase tracking-wider text-white/70 font-bold flex items-center gap-2 group-hover:text-white transition-colors">
                            <span>🎟️ Have a promo or coupon code?</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-ted-red group-hover:underline flex items-center gap-1.5 shrink-0">
                            <span>Redeem</span>
                            <span className="text-sm font-black">+</span>
                          </span>
                        </button>
                      ) : (
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-mono uppercase tracking-widest text-white/80 font-bold flex items-center gap-2">
                              <span>🎟️ Promo / Coupon Code</span>
                            </label>
                            {!appliedCoupon && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCouponExpanded(false);
                                  setCouponError(null);
                                }}
                                className="text-[11px] font-mono text-white/40 hover:text-white transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
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
                                onClick={() => {
                                  handleRemoveCoupon();
                                  setIsCouponExpanded(false);
                                }}
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
                      )}
                    </div>
                  ) : null}

                  {/* ════════════════════════════════════════════════════════════════
                      ORDER SUMMARY & AMOUNT BREAKDOWN
                      ════════════════════════════════════════════════════════════════ */}
                  <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between text-white/60">
                      <span>Standard {activeTier.name} Pass ({ticketQuantity} × ₹{activeTier.price}.00):</span>
                      <span className={appliedCoupon && ticketQuantity === 1 ? "line-through text-white/40" : "text-white"}>
                        ₹{baseOrderPrice}.00
                      </span>
                    </div>

                    {appliedCoupon && ticketQuantity === 1 && (
                      <div className="flex justify-between text-green-400 font-bold">
                        <span>Promo Code Discount ({appliedCoupon.code}):</span>
                        <span>-₹{couponDiscountAmount}.00</span>
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
                          <span>Pay ₹{payablePrice}.00 & Confirm {ticketQuantity} Pass{ticketQuantity > 1 ? "es" : ""}</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-white/40 text-center font-mono mt-3">
                      🔒 Direct UPI Deep Linking • Cloudflare Turnstile Verification • NPCI Protocol
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Laptop 2-Column Split Modal */}
      <UpiLaptopModal
        isOpen={laptopModalOpen}
        onClose={() => setLaptopModalOpen(false)}
        draftId={activeDraftId}
        authToken={activeAuthToken}
        totalAmount={payablePrice}
        tierName={activeTier.name}
        buyerName={attendees[0]?.fullName || user?.user_metadata?.full_name || "Delegate"}
        buyerEmail={user?.email || attendees[0]?.email || ""}
        ticketQuantity={ticketQuantity}
        onPaymentConfirmed={() => {
          try {
            localStorage.removeItem("tedx_local_draft_v1");
          } catch {}
          setLaptopModalOpen(false);
          setVerifiedPaymentId(`UPI-${activeDraftId.slice(-8)}`);
          setConfirmedCount(ticketQuantity);
          setIsSuccess(true);
        }}
      />

      {/* Mobile Direct Payment & Proof Modal */}
      <UpiMobilePaymentModal
        isOpen={mobileModalOpen}
        onClose={() => { setMobileModalOpen(false); setRestoreUpiSession(false); }}
        draftId={activeDraftId}
        restoreSession={restoreUpiSession}
        totalAmount={payablePrice}
        tierName={activeTier.name}
        buyerName={attendees[0]?.fullName || user?.user_metadata?.full_name || "Delegate"}
        buyerEmail={user?.email || attendees[0]?.email || ""}
        attendees={attendees.slice(0, ticketQuantity)}
        tierId={activeTier.id}
        couponCode={appliedCoupon?.code}
        discountAmount={appliedCoupon?.discountAmount}
        onSuccess={(res) => {
          try {
            localStorage.removeItem("tedx_local_draft_v1");
            sessionStorage.removeItem("tedx_active_upi_session");
          } catch {}
          setMobileModalOpen(false);
          setRestoreUpiSession(false);
          setVerifiedPaymentId(`UPI-${res.utrNumber}`);
          setConfirmedCount(res.confirmedCount || ticketQuantity);
          setIsSuccess(true);
        }}
      />
    </section>
  );
}
