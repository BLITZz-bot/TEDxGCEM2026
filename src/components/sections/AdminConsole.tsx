"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { TeamMember } from "@/lib/team-service";
import { Speaker } from "@/lib/speakers-service";
import { Partner } from "@/lib/partners-service";
import { EventSettings } from "@/lib/settings-service";
import { TicketTier } from "@/lib/ticket-service";
import { PromoCoupon } from "@/lib/coupon-service";

interface AdminRegistration {
  id: string;
  full_name: string;
  email: string;
  buyer_email?: string | null;
  phone: string;
  organization: string;
  designation?: string | null;
  linkedin?: string | null;
  referral?: string | null;
  ticket_status: string;
  ticket_count?: number | null;
  created_at: string;
  payment_id?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  utr_number?: string | null;
  payment_method?: string | null;
  payment_screenshot_url?: string | null;
  tier_id?: string | null;
  tier_name?: string | null;
  coupon_code?: string | null;
  discount_amount?: number | null;
  amount_paid?: number | null;
  amount?: number | null;
}

interface AdminMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface AdminConsoleProps {
  settings: EventSettings | null;
  onSettingsUpdate: () => void;
}

// Stable live clock store for second-by-second countdowns
let cachedNow = Date.now();
const clockListeners = new Set<() => void>();
let clockIntervalId: ReturnType<typeof setInterval> | null = null;

function subscribeToClock(notify: () => void) {
  clockListeners.add(notify);
  if (clockListeners.size === 1) {
    clockIntervalId = setInterval(() => {
      cachedNow = Date.now();
      clockListeners.forEach((fn) => fn());
    }, 1000);
  }
  return () => {
    clockListeners.delete(notify);
    if (clockListeners.size === 0 && clockIntervalId) {
      clearInterval(clockIntervalId);
      clockIntervalId = null;
    }
  };
}

function getClockSnapshot() {
  return cachedNow;
}

function getClockServerSnapshot() {
  return 0;
}

// In-Memory Stale-While-Revalidate Admin Data Cache
interface AdminDataCache {
  registrations: AdminRegistration[];
  messages: AdminMessage[];
  teamMembers: TeamMember[];
  speakersList: Speaker[];
  partnersList: Partner[];
  ticketTiers: TicketTier[];
  couponsList: PromoCoupon[];
  lastFetchedAt: number;
}

let globalAdminCache: AdminDataCache | null = null;

export default function AdminConsole({ settings, onSettingsUpdate }: AdminConsoleProps) {
  const { isAdmin, loading: authLoading } = useAuth();
  const [registrations, setRegistrations] = useState<AdminRegistration[]>(() => globalAdminCache?.registrations || []);
  const [messages, setMessages] = useState<AdminMessage[]>(() => globalAdminCache?.messages || []);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => globalAdminCache?.teamMembers || []);
  const [speakersList, setSpeakersList] = useState<Speaker[]>(() => globalAdminCache?.speakersList || []);
  const [partnersList, setPartnersList] = useState<Partner[]>(() => globalAdminCache?.partnersList || []);
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>(() => globalAdminCache?.ticketTiers || []);
  const [couponsList, setCouponsList] = useState<PromoCoupon[]>(() => globalAdminCache?.couponsList || []);
  const [loading, setLoading] = useState(() => !globalAdminCache);
  const [activeSubTab, setActiveSubTab] = useState<"registrations" | "tickets" | "coupons" | "messages" | "settings" | "team" | "speakers" | "partners" | "scanner">("registrations");
  const [errorMsg, setErrorMsg] = useState("");

  // Ticket Tiers State
  const [tierActionLoading, setTierActionLoading] = useState<string | null>(null);
  const [editingTier, setEditingTier] = useState<TicketTier | null>(null);
  const [editTierPrice, setEditTierPrice] = useState<string>("");
  const [editTierDiscountPrice, setEditTierDiscountPrice] = useState<string>("");
  const [editTierCapacity, setEditTierCapacity] = useState<string>("");
  const [editTierAllowCoupons, setEditTierAllowCoupons] = useState<boolean>(false);
  const [isSavingTierPrice, setIsSavingTierPrice] = useState<boolean>(false);
  const [tierPriceSuccessMsg, setTierPriceSuccessMsg] = useState<string | null>(null);

  // Coupon Generator States
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isGeneratingCoupon, setIsGeneratingCoupon] = useState(false);
  const [couponSuccessNotice, setCouponSuccessNotice] = useState<string | null>(null);
  const [selectedCouponTierId, setSelectedCouponTierId] = useState<string | null>(null);
  // Live clock timestamp using useSyncExternalStore with stable cached snapshot
  const nowTimestamp = React.useSyncExternalStore(subscribeToClock, getClockSnapshot, getClockServerSnapshot);

  // Ticket Scanner States
  const [scanSearchInput, setScanSearchInput] = useState("");
  const [scanMatchedReg, setScanMatchedReg] = useState<AdminRegistration | null>(null);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Initialize camera scanner when toggled
  useEffect(() => {
    if (!isScanningCamera) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scannerInstance: any = null;
    const timer = setTimeout(async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        scannerInstance = new Html5QrcodeScanner(
          "admin-camera-reader",
          { fps: 10, qrbox: { width: 220, height: 220 } },
          /* verbose= */ false
        );
        scannerInstance.render(
          (decodedText: string) => {
            const query = decodedText.toLowerCase();
            const found = registrations.find(
              (r) =>
                r.id.toLowerCase().includes(query.replace("tedx-", "")) ||
                r.email.toLowerCase().includes(query) ||
                r.full_name.toLowerCase().includes(query) ||
                (query.includes("id=") && query.includes(r.id.slice(0, 8).toLowerCase()))
            );
            if (found) {
              setScanMatchedReg(found);
              setScanMessage(null);
            } else {
              setScanMessage("Scanned QR code data: " + decodedText + " (No record matched)");
            }
          },
          () => {}
        );
      } catch (err) {
        console.error("Camera scanner error:", err);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerInstance) {
        try {
          scannerInstance.clear();
        } catch {}
      }
    };
  }, [isScanningCamera, registrations]);

  // Event settings states
  const [themeName, setThemeName] = useState(settings?.theme_name || "");
  const [revealTheme, setRevealTheme] = useState(settings ? !!settings.reveal_theme : true);
  const [revealDate, setRevealDate] = useState(settings ? !!settings.reveal_date : true);
  const [revealCountdown, setRevealCountdown] = useState(settings ? !!settings.reveal_countdown : true);
  const [eventDate, setEventDate] = useState(settings?.event_date || "");
  const [eventTime, setEventTime] = useState(settings?.event_time || "");
  const [eventDay, setEventDay] = useState(settings?.event_day || "");
  const [countdownTarget, setCountdownTarget] = useState(settings?.countdown_target || "");
  const [aboutThemeName, setAboutThemeName] = useState(settings?.about_theme_name || "");
  const [aboutThemeDesc, setAboutThemeDesc] = useState(settings?.about_theme_desc || "");
  const [revealAboutTheme, setRevealAboutTheme] = useState(settings ? !!settings.reveal_about_theme : true);
  const [revealTeam, setRevealTeam] = useState(settings ? !!settings.reveal_team : true);
  const [revealSpeakers, setRevealSpeakers] = useState(settings ? !!settings.reveal_speakers : true);
  const [revealPartners, setRevealPartners] = useState(settings ? !!settings.reveal_partners : true);
  const [revealRegister, setRevealRegister] = useState(settings ? !!settings.reveal_register : true);
  const [revealTickets, setRevealTickets] = useState(settings ? !!settings.reveal_tickets : true);
  const [revealSchedule, setRevealSchedule] = useState(settings ? !!settings.reveal_schedule : true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Team management states
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberImageUrl, setMemberImageUrl] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberLinkedin, setMemberLinkedin] = useState("");
  const [memberBio, setMemberBio] = useState("");
  const [savingMember, setSavingMember] = useState(false);

  // Speakers management states
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [speakerName, setSpeakerName] = useState("");
  const [speakerDesignation, setSpeakerDesignation] = useState("");
  const [speakerBio, setSpeakerBio] = useState("");
  const [speakerDetails, setSpeakerDetails] = useState("");
  const [speakerImageUrl, setSpeakerImageUrl] = useState("");
  const [speakerEmail, setSpeakerEmail] = useState("");
  const [speakerLinkedin, setSpeakerLinkedin] = useState("");
  const [speakerInstagram, setSpeakerInstagram] = useState("");
  const [savingSpeaker, setSavingSpeaker] = useState(false);

  // Partners management states
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerRole, setPartnerRole] = useState("");
  const [partnerLevel, setPartnerLevel] = useState("Silver");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [partnerDescription, setPartnerDescription] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [savingPartner, setSavingPartner] = useState(false);

  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeName(settings.theme_name ?? "");
      setRevealTheme(settings.reveal_theme ?? true);
      setRevealDate(settings.reveal_date ?? true);
      setRevealCountdown(settings.reveal_countdown ?? true);
      setEventDate(settings.event_date ?? "");
      setEventTime(settings.event_time ?? "");
      setEventDay(settings.event_day ?? "");
      setCountdownTarget(settings.countdown_target ?? "");
      setAboutThemeName(settings.about_theme_name ?? "");
      setAboutThemeDesc(settings.about_theme_desc ?? "");
      setRevealAboutTheme(settings.reveal_about_theme ?? true);
      setRevealTeam(settings.reveal_team ?? true);
      setRevealSpeakers(settings.reveal_speakers ?? true);
      setRevealPartners(settings.reveal_partners ?? true);
      setRevealRegister(settings.reveal_register ?? true);
      setRevealTickets(settings.reveal_tickets ?? true);
      setRevealSchedule(settings.reveal_schedule ?? true);
    }
  }, [settings]);

  const fetchData = async (isSilent = false) => {
    if (!isSilent && !globalAdminCache) {
      setLoading(true);
    }
    setErrorMsg("");
    try {
      const [regRes, msgRes, teamRes, speakersRes, partnersRes, tiersRes, couponsRes] = await Promise.allSettled([
        fetch("/api/admin/registrations"),
        fetch("/api/admin/messages"),
        fetch("/api/team"),
        fetch("/api/speakers"),
        fetch("/api/partners"),
        fetch("/api/admin/tickets"),
        fetch("/api/admin/coupons"),
      ]);

      let newRegs = globalAdminCache?.registrations || [];
      let newMsgs = globalAdminCache?.messages || [];
      let newTeam = globalAdminCache?.teamMembers || [];
      let newSpeakers = globalAdminCache?.speakersList || [];
      let newPartners = globalAdminCache?.partnersList || [];
      let newTiers = globalAdminCache?.ticketTiers || [];
      let newCoupons = globalAdminCache?.couponsList || [];

      if (regRes.status === "fulfilled" && regRes.value.ok) {
        const d = await regRes.value.json();
        if (d.registrations) {
          newRegs = d.registrations;
          setRegistrations(d.registrations);
        }
      }

      if (msgRes.status === "fulfilled" && msgRes.value.ok) {
        const d = await msgRes.value.json();
        if (d.messages) {
          newMsgs = d.messages;
          setMessages(d.messages);
        }
      }

      if (teamRes.status === "fulfilled" && teamRes.value.ok) {
        const d = await teamRes.value.json();
        if (d.team) {
          newTeam = d.team;
          setTeamMembers(d.team);
        }
      }

      if (speakersRes.status === "fulfilled" && speakersRes.value.ok) {
        const d = await speakersRes.value.json();
        if (d.speakers) {
          newSpeakers = d.speakers;
          setSpeakersList(d.speakers);
        }
      }

      if (partnersRes.status === "fulfilled" && partnersRes.value.ok) {
        const d = await partnersRes.value.json();
        if (d.partners) {
          newPartners = d.partners;
          setPartnersList(d.partners);
        }
      }

      if (tiersRes.status === "fulfilled" && tiersRes.value.ok) {
        const d = await tiersRes.value.json();
        if (d.tiers) {
          newTiers = d.tiers;
          setTicketTiers(d.tiers);
        }
      }

      if (couponsRes.status === "fulfilled" && couponsRes.value.ok) {
        const d = await couponsRes.value.json();
        if (d.coupons) {
          newCoupons = d.coupons;
          setCouponsList(d.coupons);
        }
      }

      // Update in-memory cache for instant subsequent tab switches
      globalAdminCache = {
        registrations: newRegs,
        messages: newMsgs,
        teamMembers: newTeam,
        speakersList: newSpeakers,
        partnersList: newPartners,
        ticketTiers: newTiers,
        couponsList: newCoupons,
        lastFetchedAt: Date.now(),
      };
    } catch (err: unknown) {
      console.error("Error loading admin records:", err);
      if (!isSilent) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load database records. Ensure database setup is correct.";
        setErrorMsg(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Ticket Tier Status Toggle
  const handleToggleTierStatus = async (tierId: string, currentStatus: string) => {
    setTierActionLoading(tierId);
    try {
      const nextStatus = currentStatus === "active" ? "closed" : "active";
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, action: "update_status", status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.tiers) {
        setTicketTiers(data.tiers);
      } else {
        alert(data.error || "Failed to update ticket tier.");
      }
    } catch {
      alert("Error updating tier.");
    } finally {
      setTierActionLoading(null);
    }
  };

  // Open Edit Tier Pricing Modal
  const handleOpenEditTier = (tier: TicketTier) => {
    setEditingTier(tier);
    setEditTierPrice(String(tier.price));
    setEditTierDiscountPrice(tier.discount_price !== null && tier.discount_price !== undefined ? String(tier.discount_price) : "");
    setEditTierCapacity(String(tier.total_capacity));
    setEditTierAllowCoupons(Boolean(tier.allow_coupons));
    setTierPriceSuccessMsg(null);
  };

  // Save Tier Pricing, Discount & Capacity to Supabase
  const handleSaveTierPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;

    const numPrice = Number(editTierPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      alert("Please enter a valid price (₹0 or greater).");
      return;
    }

    let numDiscountPrice: number | null = null;
    if (editTierAllowCoupons && editTierDiscountPrice.trim()) {
      numDiscountPrice = Number(editTierDiscountPrice);
      if (isNaN(numDiscountPrice) || numDiscountPrice < 0) {
        alert("Please enter a valid discount price.");
        return;
      }
      if (numDiscountPrice >= numPrice) {
        alert("Discounted promo price must be less than the regular price.");
        return;
      }
    }

    const numCapacity = Number(editTierCapacity);
    if (isNaN(numCapacity) || numCapacity < 1) {
      alert("Please enter a valid seat capacity (1 or greater).");
      return;
    }

    setIsSavingTierPrice(true);
    setTierPriceSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: editingTier.id,
          action: "update_price",
          price: numPrice,
          discountPrice: editTierAllowCoupons ? numDiscountPrice : null,
          allowCoupons: editTierAllowCoupons,
          capacity: numCapacity,
        }),
      });

      const data = await res.json();
      if (res.ok && data.tiers) {
        setTicketTiers(data.tiers);
        setTierPriceSuccessMsg(`✅ ${editingTier.name} pricing & capacity updated successfully!`);
        setTimeout(() => {
          setEditingTier(null);
          setTierPriceSuccessMsg(null);
        }, 1200);
      } else {
        alert(data.error || "Failed to update tier pricing.");
      }
    } catch {
      alert("Error updating tier pricing.");
    } finally {
      setIsSavingTierPrice(false);
    }
  };

  // Create or Auto-Generate Coupon
  const handleCreateCoupon = async (autoGen = false) => {
    setIsGeneratingCoupon(true);
    setCouponSuccessNotice(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customCode: autoGen ? "" : couponCodeInput,
          durationMinutes: 10,
          autoGenerate: autoGen,
        }),
      });

      const data = await res.json();
      if (res.ok && data.coupon) {
        setCouponSuccessNotice(`✅ 10-Minute Promo Passcode "${data.coupon.code}" created! Direct tier rate applies automatically.`);
        setCouponCodeInput("");
        if (data.coupons) {
          setCouponsList(data.coupons);
        }
      } else {
        alert(data.error || "Failed to create coupon code.");
      }
    } catch {
      alert("Error creating coupon.");
    } finally {
      setIsGeneratingCoupon(false);
    }
  };

  // Revoke / Delete Coupon
  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to revoke/delete this coupon code?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(couponId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.coupons) {
        setCouponsList(data.coupons);
      } else {
        alert(data.error || "Failed to delete coupon.");
      }
    } catch {
      alert("Error deleting coupon.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme_name: themeName,
          reveal_theme: revealTheme,
          reveal_date: revealDate,
          reveal_countdown: revealCountdown,
          event_date: eventDate,
          event_time: eventTime,
          event_day: eventDay,
          countdown_target: countdownTarget,
          about_theme_name: aboutThemeName,
          about_theme_desc: aboutThemeDesc,
          reveal_about_theme: revealAboutTheme,
          reveal_team: revealTeam,
          reveal_speakers: revealSpeakers,
          reveal_partners: revealPartners,
          reveal_register: revealRegister,
          reveal_tickets: revealTickets,
          reveal_schedule: revealSchedule,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");

      setSettingsSuccess(true);
      onSettingsUpdate();
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save settings.";
      alert("Error saving settings: " + errorMessage);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberImageUrl) {
      alert("Please upload a profile image first.");
      return;
    }
    setSavingMember(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingMemberId,
          name: memberName,
          role: memberRole,
          image_url: memberImageUrl,
          email: memberEmail,
          linkedin: memberLinkedin,
          bio: memberBio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save team member.");

      alert(editingMemberId ? "Team member profile updated!" : "New team member added!");
      handleResetMemberForm();
      
      // Reload team members list
      const teamRes = await fetch("/api/team");
      const teamData = await teamRes.json();
      if (teamRes.ok && teamData.team) {
        setTeamMembers(teamData.team);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save member.";
      alert("Error saving team member: " + errorMessage);
    } finally {
      setSavingMember(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setMemberName(member.name);
    setMemberRole(member.role);
    setMemberImageUrl(member.image_url);
    setMemberEmail(member.email || "");
    setMemberLinkedin(member.linkedin || "");
    setMemberBio(member.bio);
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this team member?")) return;
    try {
      const res = await fetch(`/api/team?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete team member.");

      setTeamMembers(prev => prev.filter(m => m.id !== id));
      alert("Team member deleted successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error deleting member: " + errorMessage);
    }
  };

  const handleResetMemberForm = () => {
    setEditingMemberId(null);
    setMemberName("");
    setMemberRole("");
    setMemberImageUrl("");
    setMemberEmail("");
    setMemberLinkedin("");
    setMemberBio("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMemberImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleTeamReveal = async () => {
    const updatedReveal = !revealTeam;
    setRevealTeam(updatedReveal);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme_name: themeName,
          reveal_theme: revealTheme,
          reveal_date: revealDate,
          reveal_countdown: revealCountdown,
          event_date: eventDate,
          event_time: eventTime,
          event_day: eventDay,
          countdown_target: countdownTarget,
          about_theme_name: aboutThemeName,
          about_theme_desc: aboutThemeDesc,
          reveal_about_theme: revealAboutTheme,
          reveal_team: updatedReveal,
          reveal_speakers: revealSpeakers,
          reveal_partners: revealPartners,
          reveal_register: revealRegister,
          reveal_tickets: revealTickets,
          reveal_schedule: revealSchedule,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");
      onSettingsUpdate();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error toggling team reveal: " + errorMessage);
      setRevealTeam(!updatedReveal);
    }
  };

  const handleToggleSpeakersReveal = async () => {
    const updatedReveal = !revealSpeakers;
    setRevealSpeakers(updatedReveal);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme_name: themeName,
          reveal_theme: revealTheme,
          reveal_date: revealDate,
          reveal_countdown: revealCountdown,
          event_date: eventDate,
          event_time: eventTime,
          event_day: eventDay,
          countdown_target: countdownTarget,
          about_theme_name: aboutThemeName,
          about_theme_desc: aboutThemeDesc,
          reveal_about_theme: revealAboutTheme,
          reveal_team: revealTeam,
          reveal_speakers: updatedReveal,
          reveal_partners: revealPartners,
          reveal_register: revealRegister,
          reveal_tickets: revealTickets,
          reveal_schedule: revealSchedule,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");
      onSettingsUpdate();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error toggling speakers reveal: " + errorMessage);
      setRevealSpeakers(!updatedReveal);
    }
  };

  const handleSaveSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speakerImageUrl) {
      alert("Please upload a profile image first.");
      return;
    }
    setSavingSpeaker(true);
    try {
      const res = await fetch("/api/speakers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingSpeakerId,
          name: speakerName,
          designation: speakerDesignation,
          image_url: speakerImageUrl,
          email: speakerEmail,
          linkedin: speakerLinkedin,
          instagram: speakerInstagram,
          bio: speakerBio,
          details: speakerDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save speaker.");

      alert(editingSpeakerId ? "Speaker profile updated!" : "New speaker added!");
      handleResetSpeakerForm();
      
      // Reload speakers list
      const speakersRes = await fetch("/api/speakers");
      const speakersData = await speakersRes.json();
      if (speakersRes.ok && speakersData.speakers) {
        setSpeakersList(speakersData.speakers);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save speaker.";
      alert("Error saving speaker: " + errorMessage);
    } finally {
      setSavingSpeaker(false);
    }
  };

  const handleEditSpeaker = (speaker: Speaker) => {
    setEditingSpeakerId(speaker.id);
    setSpeakerName(speaker.name);
    setSpeakerDesignation(speaker.designation || "");
    setSpeakerImageUrl(speaker.image_url);
    setSpeakerEmail(speaker.email || "");
    setSpeakerLinkedin(speaker.linkedin || "");
    setSpeakerInstagram(speaker.instagram || "");
    setSpeakerBio(speaker.bio);
    setSpeakerDetails(speaker.details);
  };

  const handleDeleteSpeaker = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this speaker?")) return;
    try {
      const res = await fetch(`/api/speakers?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete speaker.");

      setSpeakersList(prev => prev.filter(s => s.id !== id));
      alert("Speaker deleted successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error deleting speaker: " + errorMessage);
    }
  };

  const handleResetSpeakerForm = () => {
    setEditingSpeakerId(null);
    setSpeakerName("");
    setSpeakerDesignation("");
    setSpeakerImageUrl("");
    setSpeakerEmail("");
    setSpeakerLinkedin("");
    setSpeakerInstagram("");
    setSpeakerBio("");
    setSpeakerDetails("");
  };

  const handleSpeakerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSpeakerImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTogglePartnersReveal = async () => {
    const updatedReveal = !revealPartners;
    setRevealPartners(updatedReveal);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme_name: themeName,
          reveal_theme: revealTheme,
          reveal_date: revealDate,
          reveal_countdown: revealCountdown,
          event_date: eventDate,
          event_time: eventTime,
          event_day: eventDay,
          countdown_target: countdownTarget,
          about_theme_name: aboutThemeName,
          about_theme_desc: aboutThemeDesc,
          reveal_about_theme: revealAboutTheme,
          reveal_team: revealTeam,
          reveal_speakers: revealSpeakers,
          reveal_partners: updatedReveal,
          reveal_register: revealRegister,
          reveal_tickets: revealTickets,
          reveal_schedule: revealSchedule,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");
      onSettingsUpdate();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error toggling partners reveal: " + errorMessage);
      setRevealPartners(!updatedReveal);
    }
  };

  const handleToggleRegisterReveal = async () => {
    const updatedReveal = !revealRegister;
    setRevealRegister(updatedReveal);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme_name: themeName,
          reveal_theme: revealTheme,
          reveal_date: revealDate,
          reveal_countdown: revealCountdown,
          event_date: eventDate,
          event_time: eventTime,
          event_day: eventDay,
          countdown_target: countdownTarget,
          about_theme_name: aboutThemeName,
          about_theme_desc: aboutThemeDesc,
          reveal_about_theme: revealAboutTheme,
          reveal_team: revealTeam,
          reveal_speakers: revealSpeakers,
          reveal_partners: revealPartners,
          reveal_register: updatedReveal,
          reveal_tickets: revealTickets,
          reveal_schedule: revealSchedule,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");
      onSettingsUpdate();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error toggling registration reveal: " + errorMessage);
      setRevealRegister(!updatedReveal);
    }
  };

  const handleToggleTicketsReveal = async () => {
    const updatedReveal = !revealTickets;
    setRevealTickets(updatedReveal);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme_name: themeName,
          reveal_theme: revealTheme,
          reveal_date: revealDate,
          reveal_countdown: revealCountdown,
          event_date: eventDate,
          event_time: eventTime,
          event_day: eventDay,
          countdown_target: countdownTarget,
          about_theme_name: aboutThemeName,
          about_theme_desc: aboutThemeDesc,
          reveal_about_theme: revealAboutTheme,
          reveal_team: revealTeam,
          reveal_speakers: revealSpeakers,
          reveal_partners: revealPartners,
          reveal_register: revealRegister,
          reveal_tickets: updatedReveal,
          reveal_schedule: revealSchedule,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");
      onSettingsUpdate();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error toggling ticket download reveal: " + errorMessage);
      setRevealTickets(!updatedReveal);
    }
  };

  const handleToggleScheduleReveal = async () => {
    const updatedReveal = !revealSchedule;
    setRevealSchedule(updatedReveal);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme_name: themeName,
          reveal_theme: revealTheme,
          reveal_date: revealDate,
          reveal_countdown: revealCountdown,
          event_date: eventDate,
          event_time: eventTime,
          event_day: eventDay,
          countdown_target: countdownTarget,
          about_theme_name: aboutThemeName,
          about_theme_desc: aboutThemeDesc,
          reveal_about_theme: revealAboutTheme,
          reveal_team: revealTeam,
          reveal_speakers: revealSpeakers,
          reveal_partners: revealPartners,
          reveal_register: revealRegister,
          reveal_tickets: revealTickets,
          reveal_schedule: updatedReveal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");
      onSettingsUpdate();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error toggling schedule reveal: " + errorMessage);
      setRevealSchedule(!updatedReveal);
    }
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerLogoUrl) {
      alert("Please upload a partner logo first.");
      return;
    }
    setSavingPartner(true);
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingPartnerId,
          name: partnerName,
          role: partnerRole,
          level: partnerLevel,
          logo: partnerLogoUrl,
          description: partnerDescription,
          email: partnerEmail,
          phone: partnerPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save partner.");

      alert(editingPartnerId ? "Partner profile updated!" : "New partner added!");
      handleResetPartnerForm();
      
      // Reload partners list
      const partnersRes = await fetch("/api/partners");
      const partnersData = await partnersRes.json();
      if (partnersRes.ok && partnersData.partners) {
        setPartnersList(partnersData.partners);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save partner.";
      alert("Error saving partner: " + errorMessage);
    } finally {
      setSavingPartner(false);
    }
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartnerId(partner.id);
    setPartnerName(partner.name);
    setPartnerRole(partner.role);
    setPartnerLevel(partner.level || "Silver");
    setPartnerLogoUrl(partner.logo);
    setPartnerDescription(partner.description || "");
    setPartnerEmail(partner.email || "");
    setPartnerPhone(partner.phone || "");
  };

  const handleDeletePartner = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this partner?")) return;
    try {
      const res = await fetch(`/api/partners?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete partner.");

      setPartnersList(prev => prev.filter(p => p.id !== id));
      alert("Partner deleted successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error deleting partner: " + errorMessage);
    }
  };

  const handleResetPartnerForm = () => {
    setEditingPartnerId(null);
    setPartnerName("");
    setPartnerRole("");
    setPartnerLevel("Silver");
    setPartnerLogoUrl("");
    setPartnerDescription("");
    setPartnerEmail("");
    setPartnerPhone("");
  };

  const handlePartnerLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPartnerLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isAdmin) {
      const isSilent = !!globalAdminCache;
      const timer = setTimeout(() => {
        fetchData(isSilent);
      }, 0);

      // Auto-revalidate every 30 seconds silently while open
      const interval = setInterval(() => {
        fetchData(true);
      }, 30000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
    return undefined;
  }, [isAdmin]);



  const deleteRegistration = async (id: string) => {
    const password = window.prompt("🔒 ADMIN SECURITY CHECK:\nEnter the Admin Deletion Password to permanently delete this registration:");
    if (password === null) return; // User cancelled prompt
    if (!password.trim()) {
      alert("Admin password is required to delete a registration record.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/registrations?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-delete-password": password.trim(),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete record.");

      setRegistrations(prev => prev.filter(r => r.id !== id));
      alert("✅ Registration successfully deleted.");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("⛔ Deletion Denied: " + errorMessage);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete message.");

      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error deleting message: " + errorMessage);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // BEAUTIFUL STYLED EXCEL SPREADSHEET EXPORT (.XLS)
  // Generates a fully formatted, color-coded executive spreadsheet that opens
  // directly in Microsoft Excel, Google Sheets, Numbers, and LibreOffice.
  // ─────────────────────────────────────────────────────────────────────────────
  const exportRegistrationsToExcel = (format: "excel" | "csv" = "excel") => {
    if (registrations.length === 0) {
      alert("No registrations recorded to export.");
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const formattedExportDate = now.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedExportTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const confirmedCount = registrations.filter(
      (r) => r.ticket_status === "confirmed" || r.ticket_status === "approved" || !!r.razorpay_payment_id || !!r.payment_id
    ).length;
    const totalRevenue = registrations.reduce((sum, reg) => {
      const isConfirmed = reg.ticket_status === "confirmed" || reg.ticket_status === "approved" || !!reg.razorpay_payment_id || !!reg.payment_id;
      if (!isConfirmed) return sum;
      const val = reg.amount_paid !== null && reg.amount_paid !== undefined
        ? Number(reg.amount_paid)
        : (reg.amount !== null && reg.amount !== undefined ? Number(reg.amount) : 300);
      return sum + val;
    }, 0);

    if (format === "csv") {
      const headers = [
        "Sl No",
        "Ticket ID",
        "Date",
        "Time",
        "Attendee Name",
        "Email",
        "Phone",
        "Organization",
        "Designation",
        "Ticket Tier",
        "Ticket Status",
        "Amount Paid (INR)",
        "Coupon Code",
        "Discount (INR)",
        "Payment Method",
        "Razorpay Payment ID",
        "Razorpay Order ID",
        "Bank UTR / Ref",
        "LinkedIn",
        "Referral",
        "UUID",
      ];

      const escapeCSV = (value: unknown): string => {
        if (value === null || value === undefined) return '""';
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = registrations.map((reg, idx) => {
        const ticketId = reg.id ? `TEDX-${reg.id.slice(0, 8).toUpperCase()}` : "TEDX-PASS";
        const dateObj = reg.created_at ? new Date(reg.created_at) : null;
        const formattedDate = dateObj
          ? dateObj.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
          : "N/A";
        const formattedTime = dateObj
          ? dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
          : "N/A";
        const isConfirmed =
          reg.ticket_status === "confirmed" ||
          reg.ticket_status === "approved" ||
          !!reg.razorpay_payment_id ||
          !!reg.payment_id;
        const statusText = isConfirmed ? "Confirmed / Paid" : (reg.ticket_status || "Pending");
        const paymentId = reg.razorpay_payment_id || reg.payment_id || "N/A";
        const orderId = reg.razorpay_order_id || "N/A";
        const utr = reg.utr_number || "N/A";
        const method = reg.payment_method ? reg.payment_method.toUpperCase() : (isConfirmed ? "ONLINE" : "N/A");
        const amount = reg.amount_paid !== null && reg.amount_paid !== undefined
          ? String(reg.amount_paid)
          : (reg.amount !== null && reg.amount !== undefined ? String(reg.amount) : (isConfirmed ? "300" : "0"));
        const tierName = reg.tier_name || "Early Bird";
        const couponCode = reg.coupon_code || "None";
        const hasValidCoupon = Boolean(reg.coupon_code && Number(reg.discount_amount) > 0);
        const discountAmount = hasValidCoupon ? String(reg.discount_amount) : "0";

        return [
          escapeCSV(idx + 1),
          escapeCSV(ticketId),
          escapeCSV(formattedDate),
          escapeCSV(formattedTime),
          escapeCSV(reg.full_name),
          escapeCSV(reg.email),
          escapeCSV(reg.phone),
          escapeCSV(reg.organization),
          escapeCSV(reg.designation || "Student"),
          escapeCSV(tierName),
          escapeCSV(statusText),
          escapeCSV(amount),
          escapeCSV(couponCode),
          escapeCSV(discountAmount),
          escapeCSV(method),
          escapeCSV(paymentId),
          escapeCSV(orderId),
          escapeCSV(utr),
          escapeCSV(reg.linkedin || ""),
          escapeCSV(reg.referral || ""),
          escapeCSV(reg.id),
        ].join(",");
      });

      const csvContent = "\uFEFF" + [headers.map(escapeCSV).join(","), ...rows].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `TEDxGCEM_Registrations_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // ── BEAUTIFULLY STYLED EXCEL (HTML/XML SPREADSHEET) WITH BOOKMAN ANTIQUA (FONT SIZE 9) ──
    const rowsHtml = registrations
      .map((reg, idx) => {
        const ticketId = reg.id ? `TEDX-${reg.id.slice(0, 8).toUpperCase()}` : "TEDX-PASS";
        const dateObj = reg.created_at ? new Date(reg.created_at) : null;
        const formattedDate = dateObj
          ? dateObj.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
          : "N/A";
        const formattedTime = dateObj
          ? dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
          : "N/A";
        const isConfirmed =
          reg.ticket_status === "confirmed" ||
          reg.ticket_status === "approved" ||
          !!reg.razorpay_payment_id ||
          !!reg.payment_id;
        const statusText = isConfirmed ? "CONFIRMED / PAID" : (reg.ticket_status || "PENDING").toUpperCase();
        const paymentId = reg.razorpay_payment_id || reg.payment_id || "N/A";
        const orderId = reg.razorpay_order_id || "N/A";
        const utr = reg.utr_number || "N/A";
        const method = reg.payment_method ? reg.payment_method.toUpperCase() : (isConfirmed ? "ONLINE" : "N/A");
        const paidVal = reg.amount_paid !== null && reg.amount_paid !== undefined
          ? Number(reg.amount_paid)
          : (reg.amount !== null && reg.amount !== undefined ? Number(reg.amount) : (isConfirmed ? 300 : 0));
        const amount = `₹${paidVal.toFixed(2)}`;
        const tierName = reg.tier_name || "Early Bird";
        const couponCode = reg.coupon_code || "-";
        const discountStr = (reg.coupon_code && Number(reg.discount_amount) > 0) ? `₹${reg.discount_amount}.00` : "-";
        const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
        const statusBg = isConfirmed ? "#DCFCE7" : "#FEF08A";
        const statusColor = isConfirmed ? "#15803D" : "#854D0E";

        return `
        <tr style="background-color: ${rowBg}; height: 28px; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', 'Palatino Linotype', Georgia, serif; font-size: 9pt;">
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #64748B; font-weight: bold; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${idx + 1}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #EB0028; font-weight: bold; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; mso-number-format: '\\@';">${ticketId}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #475569; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${formattedDate}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #64748B; font-size: 9pt; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif;">${formattedTime}</td>
          <td style="border: 1px solid #E2E8F0; font-weight: bold; color: #0F172A; text-transform: uppercase; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${reg.full_name || ""}</td>
          <td style="border: 1px solid #E2E8F0; color: #2563EB; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${reg.email || ""}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #0F172A; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; mso-number-format: '\\@';">${reg.phone || ""}</td>
          <td style="border: 1px solid #E2E8F0; color: #1E293B; font-weight: 600; text-transform: uppercase; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${reg.organization || ""}</td>
          <td style="border: 1px solid #E2E8F0; color: #475569; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${reg.designation || "Student"}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #0F172A; font-weight: bold; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${tierName}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; background-color: ${statusBg}; color: ${statusColor}; font-weight: bold; font-size: 9pt; letter-spacing: 0.5px; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif;">${statusText}</td>
          <td style="text-align: right; border: 1px solid #E2E8F0; color: #0F172A; font-weight: bold; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${amount}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #64748B; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; mso-number-format: '\\@';">${couponCode}</td>
          <td style="text-align: right; border: 1px solid #E2E8F0; color: #16A34A; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${discountStr}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #475569; font-weight: 600; text-transform: uppercase; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${method}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #0F172A; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; mso-number-format: '\\@';">${paymentId}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #64748B; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; mso-number-format: '\\@';">${orderId}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #0F172A; font-weight: bold; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; mso-number-format: '\\@';">${utr}</td>
          <td style="border: 1px solid #E2E8F0; color: #0284C7; font-size: 9pt; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif;">${reg.linkedin ? `<a href="${reg.linkedin}" style="color: #0284C7;">${reg.linkedin}</a>` : "-"}</td>
          <td style="border: 1px solid #E2E8F0; color: #475569; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${reg.referral || "-"}</td>
          <td style="border: 1px solid #E2E8F0; color: #94A3B8; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; mso-number-format: '\\@';">${reg.id}</td>
        </tr>`;
      })
      .join("");

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>TEDxGCEM 2026 Registrations</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          * { font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', 'Palatino Linotype', Georgia, serif !important; font-size: 9pt; }
          body { font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; margin: 0; padding: 20px; }
          table { border-collapse: collapse; width: 100%; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; }
          th, td { vertical-align: middle; padding: 6px 10px; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; }
          .banner-title { font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 13pt; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; }
          .kpi-title { font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 8pt; text-transform: uppercase; color: #94A3B8; font-weight: 700; letter-spacing: 1px; }
          .kpi-value { font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 11pt; font-weight: 900; color: #FFFFFF; }
        </style>
      </head>
      <body>
        <table>
          <!-- BRAND BANNER HEADER -->
          <tr style="background-color: #000000; height: 45px;">
            <td colspan="21" style="background-color: #000000; border-top: 4px solid #EB0028; padding: 12px 16px;">
              <div class="banner-title"><span style="color: #EB0028;">TEDx</span>GCEM 2026 — OFFICIAL ATTENDEE DELEGATE & TRANSACTION REGISTRY</div>
              <div style="color: #94A3B8; font-size: 9pt; margin-top: 3px; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif;">
                Gopalan College of Engineering & Management &nbsp;|&nbsp; Exported on: <strong>${formattedExportDate} at ${formattedExportTime}</strong> &nbsp;|&nbsp; Confidential Organizing Committee Document
              </div>
            </td>
          </tr>

          <!-- KPI SUMMARY STATS CARDS -->
          <tr style="background-color: #0F172A; height: 38px;">
            <td colspan="4" style="background-color: #0F172A; border-right: 1px solid #334155; padding: 8px 12px;">
              <div class="kpi-title">TOTAL REGISTERED</div>
              <div class="kpi-value" style="color: #FFFFFF;">${registrations.length} <span style="font-size: 9pt; font-weight: normal; color: #94A3B8;">Delegates</span></div>
            </td>
            <td colspan="4" style="background-color: #0F172A; border-right: 1px solid #334155; padding: 8px 12px;">
              <div class="kpi-title">CONFIRMED PASSES</div>
              <div class="kpi-value" style="color: #4ADE80;">${confirmedCount} <span style="font-size: 9pt; font-weight: normal; color: #94A3B8;">Paid Tickets</span></div>
            </td>
            <td colspan="5" style="background-color: #0F172A; border-right: 1px solid #334155; padding: 8px 12px;">
              <div class="kpi-title">TOTAL REVENUE COLLECTED</div>
              <div class="kpi-value" style="color: #FACC15;">₹${totalRevenue.toLocaleString("en-IN")} <span style="font-size: 9pt; font-weight: normal; color: #94A3B8;">INR</span></div>
            </td>
            <td colspan="8" style="background-color: #0F172A; padding: 8px 12px;">
              <div class="kpi-title">PAYMENT VERIFICATION</div>
              <div class="kpi-value" style="color: #38BDF8; font-size: 9pt;">Direct UPI &amp; Bank UTR Protocol (NPCI)</div>
            </td>
          </tr>

          <!-- EMPTY SPACING ROW -->
          <tr style="height: 10px;"><td colspan="21" style="border: none;"></td></tr>

          <!-- TABLE COLUMN HEADERS -->
          <tr style="background-color: #EB0028; height: 34px; color: #FFFFFF; font-weight: bold; text-transform: uppercase; font-size: 9pt; letter-spacing: 0.5px; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif;">
            <th style="border: 1px solid #B91C1C; text-align: center; width: 45px; font-size: 9pt;">#</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 130px; font-size: 9pt;">Ticket ID</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 110px; font-size: 9pt;">Date</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 95px; font-size: 9pt;">Time</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 180px; font-size: 9pt;">Attendee Name</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 220px; font-size: 9pt;">Email Address</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 130px; font-size: 9pt;">Phone Number</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 200px; font-size: 9pt;">Institution / Org</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 140px; font-size: 9pt;">Designation</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 130px; font-size: 9pt;">Ticket Tier</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 130px; font-size: 9pt;">Ticket Status</th>
            <th style="border: 1px solid #B91C1C; text-align: right; width: 110px; font-size: 9pt;">Amount Paid</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 120px; font-size: 9pt;">Coupon Code</th>
            <th style="border: 1px solid #B91C1C; text-align: right; width: 110px; font-size: 9pt;">Discount Amount</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 110px; font-size: 9pt;">Method</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 170px; font-size: 9pt;">Payment ID / Ref</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 170px; font-size: 9pt;">Order / Session ID</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 140px; font-size: 9pt;">Bank UTR Number</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 180px; font-size: 9pt;">LinkedIn Profile</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 140px; font-size: 9pt;">Referral Source</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 150px; font-size: 9pt;">Database UUID</th>
          </tr>

          <!-- DATA ROWS -->
          ${rowsHtml}

          <!-- SUMMARY FOOTER ROW -->
          <tr style="background-color: #000000; height: 32px; color: #FFFFFF; font-weight: bold; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">
            <td colspan="11" style="text-align: right; border: 1px solid #334155; padding-right: 16px; text-transform: uppercase; font-size: 9pt;">
              TOTAL CONFIRMED REVENUE (${confirmedCount} TICKETS):
            </td>
            <td style="text-align: right; border: 1px solid #334155; color: #4ADE80; font-size: 10pt; font-weight: 900; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif;">
              ₹${totalRevenue.toLocaleString("en-IN")}.00
            </td>
            <td colspan="9" style="border: 1px solid #334155; color: #94A3B8; font-size: 9pt; text-align: right; padding-right: 14px; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif;">
              Generated from TEDxGCEM Admin Portal &nbsp;|&nbsp; All Rights Reserved
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TEDxGCEM_Registrations_${timestamp}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportMessagesToExcel = (format: "excel" | "csv" = "excel") => {
    if (messages.length === 0) {
      alert("No messages recorded to export.");
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const formattedExportDate = now.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedExportTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    if (format === "csv") {
      const headers = ["Sl No", "Message ID", "Date", "Time", "Sender Name", "Sender Email", "Message Body"];
      const escapeCSV = (value: unknown): string => {
        if (value === null || value === undefined) return '""';
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      };
      const rows = messages.map((msg, idx) => {
        const dateObj = msg.created_at ? new Date(msg.created_at) : null;
        const formattedDate = dateObj
          ? dateObj.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
          : "N/A";
        const formattedTime = dateObj
          ? dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
          : "N/A";
        return [
          escapeCSV(idx + 1),
          escapeCSV(msg.id),
          escapeCSV(formattedDate),
          escapeCSV(formattedTime),
          escapeCSV(msg.name),
          escapeCSV(msg.email),
          escapeCSV(msg.message),
        ].join(",");
      });

      const csvContent = "\uFEFF" + [headers.map(escapeCSV).join(","), ...rows].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `TEDxGCEM_Contact_Messages_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // ── BEAUTIFUL STYLED MESSAGES EXCEL (.XLS) WITH BOOKMAN ANTIQUA (FONT SIZE 9) ──
    const rowsHtml = messages
      .map((msg, idx) => {
        const dateObj = msg.created_at ? new Date(msg.created_at) : null;
        const formattedDate = dateObj
          ? dateObj.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
          : "N/A";
        const formattedTime = dateObj
          ? dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
          : "N/A";
        const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";

        return `
        <tr style="background-color: ${rowBg}; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #64748B; font-weight: bold; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${idx + 1}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #475569; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${formattedDate}</td>
          <td style="text-align: center; border: 1px solid #E2E8F0; color: #64748B; font-size: 9pt; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif;">${formattedTime}</td>
          <td style="border: 1px solid #E2E8F0; font-weight: bold; color: #0F172A; text-transform: uppercase; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${msg.name}</td>
          <td style="border: 1px solid #E2E8F0; color: #2563EB; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${msg.email}</td>
          <td style="border: 1px solid #E2E8F0; color: #1E293B; white-space: pre-wrap; line-height: 1.4; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt;">${msg.message}</td>
          <td style="border: 1px solid #E2E8F0; color: #94A3B8; font-size: 9pt; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; mso-number-format: '\\@';">${msg.id}</td>
        </tr>`;
      })
      .join("");

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>TEDxGCEM Inbox Messages</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          * { font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', 'Palatino Linotype', Georgia, serif !important; font-size: 9pt; }
          body { font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; margin: 0; padding: 20px; }
          table { border-collapse: collapse; width: 100%; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; }
          th, td { vertical-align: middle; padding: 6px 10px; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 9pt; }
          .banner-title { font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif; font-size: 13pt; font-weight: 900; color: #FFFFFF; }
        </style>
      </head>
      <body>
        <table>
          <tr style="background-color: #000000; height: 45px;">
            <td colspan="7" style="background-color: #000000; border-top: 4px solid #EB0028; padding: 12px 16px;">
              <div class="banner-title"><span style="color: #EB0028;">TEDx</span>GCEM 2026 — INBOX CONTACT MESSAGES DIRECTORY</div>
              <div style="color: #94A3B8; font-size: 9pt; margin-top: 3px; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif;">
                Total Submissions: <strong>${messages.length} Messages</strong> &nbsp;|&nbsp; Exported on: <strong>${formattedExportDate} at ${formattedExportTime}</strong>
              </div>
            </td>
          </tr>
          <tr style="height: 10px;"><td colspan="7" style="border: none;"></td></tr>
          <tr style="background-color: #EB0028; height: 34px; color: #FFFFFF; font-weight: bold; text-transform: uppercase; font-size: 9pt; font-family: 'Bookman Antiqua', 'Bookman Old Style', 'Bookman', serif;">
            <th style="border: 1px solid #B91C1C; text-align: center; width: 45px; font-size: 9pt;">#</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 110px; font-size: 9pt;">Date</th>
            <th style="border: 1px solid #B91C1C; text-align: center; width: 95px; font-size: 9pt;">Time</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 180px; font-size: 9pt;">Sender Name</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 220px; font-size: 9pt;">Email Address</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 400px; font-size: 9pt;">Message Body</th>
            <th style="border: 1px solid #B91C1C; text-align: left; width: 150px; font-size: 9pt;">Message ID</th>
          </tr>
          ${rowsHtml}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TEDxGCEM_Contact_Messages_${timestamp}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-ted-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-ted-red/10 border border-ted-red/25 flex items-center justify-center text-ted-red shadow-inner">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m-3 3h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">Access Denied</h2>
          <p className="text-white/50 text-sm max-w-sm">
            Only authorized organizing committee members can access the administrative database portal.
          </p>
        </div>
      </div>
    );
  }

  // Calculate quick stats
  const totalRegistrations = registrations.length;
  const totalMessages = messages.length;

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col">
      {/* Page Header */}
      <div className="w-full mb-12 flex flex-col justify-between items-start gap-6 border-b border-white/10 pb-12">
        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-[0.95]">
          ADMIN <span className="text-ted-red">CONSOLE</span>
        </h2>
        <p className="text-white/60 text-base font-light">
          Monitor attendee pass applications, manage ticket verification status, and view contact submissions.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-8 p-6 bg-ted-red/10 border border-ted-red/30 rounded-2xl text-white space-y-3">
          <p className="font-mono text-sm font-bold">⚠️ Data Access Error:</p>
          <p className="text-xs text-white/70">{errorMsg}</p>
          <div className="pt-2 text-xs text-white/50">
            Ensure you run the database setup commands in Supabase SQL editor to create the registrations and messages tables.
          </div>
        </div>
      )}

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-ted-dark-gray/30 border border-white/5 p-6 rounded-2xl">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-1">Total Successful Registrations</span>
          <span className="text-3xl font-black text-white">{totalRegistrations}</span>
        </div>
        <div className="bg-ted-dark-gray/30 border border-white/5 p-6 rounded-2xl">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-1">Total Inbox Messages</span>
          <span className="text-3xl font-black text-white">{totalMessages}</span>
        </div>
      </div>

      {/* Subtab Switcher */}
      <div className="flex flex-wrap gap-3 border-b border-white/5 pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveSubTab("registrations")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeSubTab === "registrations" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Registrations ({totalRegistrations})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("tickets")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeSubTab === "tickets" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Ticket Tiers ({ticketTiers.length || 4})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("messages")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeSubTab === "messages" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Contact Messages ({totalMessages})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("settings")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeSubTab === "settings" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Event Controls
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("team")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeSubTab === "team" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Team Manager ({teamMembers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("speakers")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeSubTab === "speakers" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Speakers Manager ({speakersList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("partners")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeSubTab === "partners" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Partners Manager ({partnersList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("scanner")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "scanner" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          <span>📷</span> Ticket Scanner
        </button>
        <div className="md:ml-auto flex flex-wrap items-center gap-2">
          {activeSubTab === "registrations" && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => exportRegistrationsToExcel("excel")}
                disabled={registrations.length === 0}
                title="Download formatted executive Excel spreadsheet (.xls) with full branding, KPI summary cards & color coding"
                className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-full transition-all text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Download Excel ({registrations.length})</span>
              </button>
              <button
                type="button"
                onClick={() => exportRegistrationsToExcel("csv")}
                disabled={registrations.length === 0}
                title="Download plain raw CSV (.csv)"
                className="px-2.5 py-2 bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all text-xs font-mono uppercase tracking-widest font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                CSV
              </button>
            </div>
          )}
          {activeSubTab === "messages" && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => exportMessagesToExcel("excel")}
                disabled={messages.length === 0}
                title="Download formatted executive Excel spreadsheet (.xls) of contact messages"
                className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-full transition-all text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Download Excel ({messages.length})</span>
              </button>
              <button
                type="button"
                onClick={() => exportMessagesToExcel("csv")}
                disabled={messages.length === 0}
                title="Download plain raw CSV (.csv)"
                className="px-2.5 py-2 bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all text-xs font-mono uppercase tracking-widest font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                CSV
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => fetchData(false)}
            disabled={loading}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.5" />
            </svg>
            Reload
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-ted-dark-gray/50 border border-white/10 rounded-[2rem] p-6 md:p-8 overflow-hidden min-h-[300px] flex flex-col">
        {loading ? (
          <div className="flex-grow flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-ted-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeSubTab === "registrations" ? (
          /* REGISTRATIONS VIEW */
          <div className="space-y-6">
            {/* Visibility toggle control cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
              {/* Register Now toggle card */}
              <div className="border border-white/10 p-5 rounded-2xl bg-black/40 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Visibility Controls"}</span>
                  <label className="text-xs font-bold text-white uppercase tracking-wider block">Reveal Registrations Form (Register Now)</label>
                  <span className="text-[9px] text-white/30 block">
                    {revealRegister 
                      ? "Currently showing intake form on website" 
                      : "Currently hiding registration intake globally"
                    }
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleRegisterReveal}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                    revealRegister ? "bg-ted-red" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                      revealRegister ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Get My Pass toggle card */}
              <div className="border border-white/10 p-5 rounded-2xl bg-black/40 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Visibility Controls"}</span>
                  <label className="text-xs font-bold text-white uppercase tracking-wider block">Reveal Ticket Download (Get My Pass)</label>
                  <span className="text-[9px] text-white/30 block">
                    {revealTickets 
                      ? "Currently showing ticket pass download on website" 
                      : "Currently hiding ticket pass downloader globally"
                    }
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleTicketsReveal}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                    revealTickets ? "bg-ted-red" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                      revealTickets ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Export & Records Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-black/30 border border-white/5 font-mono">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>📊</span> Attendee Database ({registrations.length} Total Records)
                </div>
                <p className="text-[10px] text-white/40">
                  Exports a beautiful, standalone spreadsheet (.xls). Local edits in Excel will never alter your live database.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => exportRegistrationsToExcel("excel")}
                  disabled={registrations.length === 0}
                  className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Styled Excel (.xls)
                </button>
                <button
                  type="button"
                  onClick={() => exportRegistrationsToExcel("csv")}
                  disabled={registrations.length === 0}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {registrations.length === 0 ? (
                <p className="text-center text-white/40 py-16 font-mono text-sm">No registrations recorded yet.</p>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 font-mono uppercase tracking-wider">
                      <th className="pb-4 pr-4">Attendee</th>
                      <th className="pb-4 px-4">Contact Info</th>
                      <th className="pb-4 px-4">Organization / Role</th>
                      <th className="pb-4 px-4">Ticket Tier</th>
                      <th className="pb-4 px-4">Status & Paid</th>
                      <th className="pb-4 px-4">Coupon Used</th>
                      <th className="pb-4 px-4">Razorpay Payment ID / UTR</th>
                      <th className="pb-4 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {registrations.map((reg) => {
                      const isConfirmed = reg.ticket_status === "confirmed" || reg.ticket_status === "approved" || !!reg.razorpay_payment_id || !!reg.payment_id;
                      const paymentId = reg.razorpay_payment_id || reg.payment_id;
                      const paidVal = reg.amount_paid !== null && reg.amount_paid !== undefined ? reg.amount_paid : (isConfirmed ? 300 : 0);
                      return (
                        <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pr-4">
                            <div className="font-bold text-white uppercase tracking-wider">{reg.full_name}</div>
                            <div className="text-[10px] text-white/30 font-mono mt-0.5">{new Date(reg.created_at).toLocaleDateString()}</div>
                            <div className="text-[9px] text-white/20 font-mono">ID: TEDX-{reg.id.slice(0, 8).toUpperCase()}</div>
                          </td>
                          <td className="py-4 px-4 space-y-1">
                            <div className="text-white/90 font-mono">{reg.email}</div>
                            {reg.buyer_email && reg.buyer_email.toLowerCase() !== reg.email.toLowerCase() && (
                              <div className="text-[10px] text-blue-400 font-mono">
                                ↳ Booked by: {reg.buyer_email}
                              </div>
                            )}
                            <div className="text-ted-red font-mono text-[11px]">{reg.phone}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="uppercase text-white/80 font-bold">{reg.organization}</div>
                            <div className="text-[10px] text-white/40">{reg.designation || "Student"}</div>
                          </td>
                          <td className="py-4 px-4 font-mono">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase">
                              {reg.tier_name || "Early Bird"}
                            </span>
                          </td>
                          <td className="py-4 px-4 space-y-1">
                            {isConfirmed ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-[10px] uppercase font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Paid (₹{paidVal})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono text-[10px] uppercase font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                Pending
                              </span>
                            )}
                            {reg.payment_method && (
                              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                Method: <span className="text-white">{reg.payment_method}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono">
                            {reg.coupon_code ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-ted-red/15 border border-ted-red/30 text-ted-red font-bold text-[10px]">
                                  🏷️ {reg.coupon_code}
                                </span>
                                {reg.discount_amount ? (
                                  <div className="text-[9px] text-green-400 font-bold">-₹{reg.discount_amount} Discount</div>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-white/20 text-[10px]">None</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono space-y-1">
                            {paymentId ? (
                              <div>
                                <div className="text-ted-red font-bold">{paymentId}</div>
                                {reg.utr_number ? (
                                  <div className="text-[10px] text-white/60">UTR: <span className="text-white font-bold">{reg.utr_number}</span></div>
                                ) : (
                                  <div className="text-[10px] text-white/30">UTR: N/A</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-white/25 italic">No Payment Record</span>
                            )}
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <button
                              type="button"
                              onClick={() => deleteRegistration(reg.id)}
                              className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-ted-red hover:text-white rounded-lg uppercase text-white/50 cursor-pointer font-bold transition-all text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : activeSubTab === "tickets" ? (
          !selectedCouponTierId ? (
            /* TICKET TIERS VIEW */
            <div className="space-y-8">
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 space-y-3 font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// TICKET CAPACITY & AUTO-PHASE CONTROLS"}</span>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Phased Ticketing & Capacity Management</h3>
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs font-bold">
                  Public Frontend: <strong className="text-green-400 font-black">Quota Counters Hidden</strong>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Tickets advance automatically once filled. Early Bird has no coupon discount. For Phase 1–3, admin-generated promo codes apply the previous tier price (e.g. Phase 1 @ ₹400 drops to ₹300).
              </p>
            </div>

            {/* Ticket Tier Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ticketTiers.map((tier) => {
                const soldCount = tier.sold_count ?? 0;
                const isSoldOut = soldCount >= tier.total_capacity;
                const isLive = tier.status === "active";
                const percentage = Math.min(100, Math.round((soldCount / tier.total_capacity) * 100));

                return (
                  <div
                    key={tier.id}
                    className={`border rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all ${
                      isLive
                        ? "bg-ted-red/5 border-ted-red/40 shadow-[0_0_25px_rgba(235,0,40,0.15)]"
                        : "bg-black/40 border-white/10"
                    }`}
                  >
                    <div
                      className={`space-y-3 ${isLive && tier.allow_coupons ? "cursor-pointer group" : ""}`}
                      onClick={() => {
                        if (isLive && tier.allow_coupons) {
                          setSelectedCouponTierId(tier.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{tier.tag}</span>
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/40 text-green-400 text-[10px] font-bold uppercase font-mono group-hover:bg-green-500 group-hover:text-black transition-all">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live
                          </span>
                        ) : isSoldOut ? (
                          <span className="px-2 py-0.5 rounded-full bg-ted-red/20 border border-ted-red/40 text-ted-red text-[10px] font-bold uppercase font-mono">
                            Sold Out
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase font-mono">
                            {tier.status.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className={`text-lg font-black uppercase tracking-tight transition-colors ${
                          isLive && tier.allow_coupons ? "text-white group-hover:text-emerald-400" : "text-white"
                        }`}>
                          {tier.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-ted-red">₹{tier.price}</span>
                          {tier.discount_price && (
                            <span className="text-xs text-white/40 font-mono">
                              (w/ Coupon: <strong className="text-white">₹{tier.discount_price}</strong>)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Capacity Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-white/10 font-mono">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/50">Sold Capacity</span>
                          <span className="font-bold text-white">
                            {soldCount} / {tier.total_capacity} <span className="text-white/40 text-[10px]">({percentage}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isLive ? "bg-ted-red" : isSoldOut ? "bg-red-700" : "bg-white/30"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-white/30 flex justify-between">
                          <span>Remaining: <strong className="text-white/70">{Math.max(0, tier.total_capacity - soldCount)}</strong></span>
                          <span>Coupons: <strong className={tier.allow_coupons ? "text-green-400" : "text-white/30"}>{tier.allow_coupons ? "Allowed" : "Disabled"}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action & Edit Buttons */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditTier(tier);
                        }}
                        className="w-full py-2 px-3 rounded-xl text-[11px] font-bold uppercase font-mono tracking-wider transition-all cursor-pointer bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 flex items-center justify-center gap-1.5"
                      >
                        <span>✏️</span>
                        <span>Edit Price &amp; Seats</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTierStatus(tier.id, tier.status);
                        }}
                        disabled={tierActionLoading === tier.id}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase font-mono tracking-wider transition-all cursor-pointer disabled:opacity-50 ${
                          isLive
                            ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                            : "bg-ted-red hover:bg-white hover:text-ted-red text-white"
                        }`}
                      >
                        {tierActionLoading === tier.id
                          ? "Updating..."
                          : isLive
                          ? "Close Phase / Disable"
                          : "Set Active / Open Phase"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* EDIT TIER PRICING & SEATS MODAL */}
            {editingTier && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                <div className="w-full max-w-lg bg-[#0F0F12] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-ted-red uppercase tracking-widest block">
                        {"// LIVE TIER PRICING & CAPACITY"}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                        Edit {editingTier.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingTier(null)}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer border border-white/10 text-xs font-mono"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSaveTierPrice} className="space-y-4">
                    {/* Regular Base Price */}
                    <div className="space-y-1.5 font-mono">
                      <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">
                        Base Price (₹) <span className="text-ted-red">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          value={editTierPrice}
                          onChange={(e) => setEditTierPrice(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-ted-red transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-white/40 leading-snug">
                        Regular price charged when attendee buys without promo code.
                      </p>
                    </div>

                    {/* Total Capacity Seats */}
                    <div className="space-y-1.5 font-mono">
                      <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">
                        Total Seat Capacity <span className="text-ted-red">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={editTierCapacity}
                        onChange={(e) => setEditTierCapacity(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-ted-red transition-all"
                      />
                      <p className="text-[11px] text-white/40 leading-snug">
                        Tier automatically marks as Sold Out once sold seats reach this limit.
                      </p>
                    </div>

                    {/* Allow Coupons Toggle */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 font-mono">
                      <label className="flex items-center space-x-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editTierAllowCoupons}
                          onChange={(e) => setEditTierAllowCoupons(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 text-ted-red focus:ring-ted-red bg-black/50 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block uppercase">Allow Promo Passcodes / Coupons</span>
                          <span className="text-[10px] text-white/40 block">
                            When enabled, attendees can enter 10-minute promo codes generated by the committee.
                          </span>
                        </div>
                      </label>

                      {/* Discount Price Input (If coupons allowed) */}
                      {editTierAllowCoupons && (
                        <div className="pt-2 border-t border-white/10 space-y-1.5 animate-in fade-in duration-150">
                          <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                            Discounted Price With Promo Code (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={editTierDiscountPrice}
                              onChange={(e) => setEditTierDiscountPrice(e.target.value)}
                              placeholder="e.g. 400"
                              className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 transition-all"
                            />
                          </div>
                          <p className="text-[10px] text-white/40 leading-snug">
                            The special discounted price applied when a promo passcode is used (e.g. ₹{editTierPrice || "500"} → ₹{editTierDiscountPrice || "400"}).
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Success notification banner */}
                    {tierPriceSuccessMsg && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold text-center">
                        {tierPriceSuccessMsg}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 font-mono">
                      <button
                        type="button"
                        onClick={() => setEditingTier(null)}
                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-white/10"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingTierPrice}
                        className="px-6 py-2.5 rounded-xl bg-ted-red hover:bg-white hover:text-ted-red text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSavingTierPrice ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving in Supabase...</span>
                          </>
                        ) : (
                          <>
                            <span>💾 Save Tier Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* DEDICATED FULL-WINDOW FOR ACTIVE TIER COUPONS & DISCOUNTS */
          (() => {
            const activeCouponTier = ticketTiers.find(
              (t) => t.id === selectedCouponTierId && t.status === "active" && t.allow_coupons
            );
            if (!activeCouponTier) return null;

            const discountPercent = Math.round(
              (((activeCouponTier.price - (activeCouponTier.discount_price ?? 0)) / activeCouponTier.price) * 100)
            );

            return (
              <div className="space-y-6">
                {/* Top Navigation Bar: Back Button */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <button
                    type="button"
                    onClick={() => setSelectedCouponTierId(null)}
                    className="group flex items-center gap-2.5 text-xs font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white transition-all cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10"
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
                    <span>← Back to Ticket Tiers</span>
                  </button>

                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Portal: {activeCouponTier.name}</span>
                  </div>
                </div>

                {/* Main Generator & Rules Header Window */}
                <div className="border border-white/10 p-6 md:p-8 rounded-2xl bg-black/40 space-y-6">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black font-mono block">
                      {"// " + activeCouponTier.name.toUpperCase() + " 10-MINUTE PROMO PASSCODE ENGINE"}
                    </span>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider mt-1">
                      {activeCouponTier.name} Exclusive Passcode Window
                    </h3>
                    <p className="text-xs text-white/50 font-mono mt-1 leading-relaxed">
                      Generated promo codes expire automatically <strong>10 minutes</strong> after creation. Standard price for {activeCouponTier.name} is <strong className="text-white">₹{activeCouponTier.price}</strong>. Applying a code unlocks the direct rate of <strong className="text-emerald-400 font-bold">₹{activeCouponTier.discount_price}</strong> ({discountPercent}% OFF), and deducts directly from {activeCouponTier.name}&apos;s capacity.
                    </p>
                  </div>

                  {couponSuccessNotice && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-xs font-bold flex items-center justify-between">
                      <span>{couponSuccessNotice}</span>
                      <button
                        type="button"
                        onClick={() => setCouponSuccessNotice(null)}
                        className="text-white/40 hover:text-white cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Generator Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end font-mono pt-2 border-t border-white/10">
                    <div className="md:col-span-1">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold">
                        Custom Passcode (Optional)
                      </label>
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="Leave empty or enter code..."
                        className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => handleCreateCoupon(true)}
                        disabled={isGeneratingCoupon}
                        className="flex-1 py-3.5 px-6 bg-emerald-500 hover:bg-white hover:text-emerald-700 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2"
                      >
                        <span>⚡</span>
                        <span>{isGeneratingCoupon ? "Generating..." : `Auto-Generate 10-Min Passcode for ${activeCouponTier.name}`}</span>
                      </button>
                      {couponCodeInput.trim() && (
                        <button
                          type="button"
                          onClick={() => handleCreateCoupon(false)}
                          disabled={isGeneratingCoupon}
                          className="py-3.5 px-6 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          Create Custom Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* UNUSED / ACTIVE COUPONS TABLE */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Active & Unused Promo Codes</h4>
                    </div>
                    <span className="text-xs text-white/40">
                      {couponsList.filter((c) => !c.is_used).length} Available
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider">
                          <th className="pb-3 pr-4">Passcode</th>
                          <th className="pb-3 px-4">Rate Unlocked</th>
                          <th className="pb-3 px-4">Created Time</th>
                          <th className="pb-3 px-4">Live Expiry Countdown</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 pl-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {couponsList.filter((c) => !c.is_used).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-white/30 italic">
                              No active unused promo codes. Click &quot;Auto-Generate 10-Min Passcode&quot; above to create one.
                            </td>
                          </tr>
                        ) : (
                          couponsList
                            .filter((c) => !c.is_used)
                            .map((cpn) => {
                              const expiryMs = new Date(cpn.expires_at).getTime();
                              const diffSec = Math.max(0, Math.floor((expiryMs - nowTimestamp) / 1000));
                              const isExpired = diffSec <= 0;
                              const mins = Math.floor(diffSec / 60);
                              const secs = diffSec % 60;
                              const formattedRemaining = `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;

                              return (
                                <tr key={cpn.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-3.5 pr-4">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-sm tracking-wider bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                                        {cpn.code}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(cpn.code);
                                          alert(`Copied "${cpn.code}" to clipboard!`);
                                        }}
                                        className="p-1 text-white/40 hover:text-white cursor-pointer text-xs"
                                        title="Copy Code"
                                      >
                                        📋
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                                    ₹{activeCouponTier.discount_price} ({activeCouponTier.name})
                                  </td>
                                  <td className="py-3.5 px-4 text-white/50 text-[11px]">
                                    {new Date(cpn.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    {!isExpired ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {formattedRemaining} remaining
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase">
                                        Expired (10m passed)
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    {!isExpired ? (
                                      <span className="text-white/80 font-bold">Unused</span>
                                    ) : (
                                      <span className="text-white/30">Void</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 pl-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCoupon(cpn.id)}
                                      className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-ted-red hover:text-white text-white/40 rounded-lg text-xs transition-all cursor-pointer"
                                    >
                                      Revoke
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* REDEEMED / USED COUPONS TABLE */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Redeemed & Used Promo Codes</h4>
                    </div>
                    <span className="text-xs text-white/40">
                      {couponsList.filter((c) => c.is_used).length} Redeemed
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider">
                          <th className="pb-3 pr-4">Code</th>
                          <th className="pb-3 px-4">Attendee Details</th>
                          <th className="pb-3 px-4">Contact Info</th>
                          <th className="pb-3 px-4">Institution</th>
                          <th className="pb-3 px-4">Amount Paid</th>
                          <th className="pb-3 pl-4 text-right">Redeemed At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {couponsList.filter((c) => c.is_used).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-white/30 italic">
                              No coupons redeemed yet. When attendees apply a coupon during registration, their record will appear here.
                            </td>
                          </tr>
                        ) : (
                          couponsList
                            .filter((c) => c.is_used)
                            .map((cpn) => (
                              <tr key={cpn.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3.5 pr-4">
                                  <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                    {cpn.code}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-sans">
                                  <div className="font-bold text-white uppercase">{cpn.used_by_name || "N/A"}</div>
                                  <div className="text-[10px] text-white/40 font-mono">{cpn.used_by_email || ""}</div>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-emerald-400">
                                  {cpn.used_by_phone || "N/A"}
                                </td>
                                <td className="py-3.5 px-4 text-white/70 uppercase">
                                  {cpn.used_by_org || "-"}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-emerald-400">
                                  ₹{activeCouponTier.discount_price} ({activeCouponTier.name})
                                </td>
                                <td className="py-3.5 pl-4 text-right text-white/40 text-[11px]">
                                  {cpn.used_at ? new Date(cpn.used_at).toLocaleString("en-IN") : "N/A"}
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()
        )
        ) : activeSubTab === "messages" ? (
          /* MESSAGES VIEW */
          <div className="space-y-6">
            {messages.length === 0 ? (
              <p className="text-center text-white/40 py-16 font-mono text-sm">No messages received yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="border border-white/5 bg-black/20 p-6 rounded-2xl space-y-4 relative group">
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-ted-red hover:text-white rounded-lg text-[10px] uppercase tracking-wider font-mono font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-2">
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-white uppercase text-sm tracking-wider">{msg.name}</h5>
                        <div className="text-xs text-ted-red font-mono">{msg.email}</div>
                      </div>
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1 md:mt-0">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeSubTab === "settings" ? (
          /* SETTINGS/EVENT CONTROLS VIEW */
          <form onSubmit={handleSaveSettings} className="space-y-8 font-mono">
            {settingsSuccess && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Settings saved successfully! Website content has been updated.
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1: Theme controls */}
              <div className="border border-white/10 p-6 rounded-2xl bg-black/40 space-y-4">
                <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Theme Config"}</span>
                
                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider block">Theme Name</label>
                  <input
                    type="text"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    placeholder="e.g. RIPPLE"
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Reveal Theme on Website</label>
                    <span className="text-[9px] text-white/30 block">Toggle off to show &apos;THE JOURNEY BEGINS SOON&apos; globally</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealTheme(!revealTheme)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      revealTheme ? "bg-ted-red" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        revealTheme ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Row 2: Date & Time controls */}
              <div className="border border-white/10 p-6 rounded-2xl bg-black/40 space-y-4">
                <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Timeline Info"}</span>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Event Date</label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="e.g. October 15, 2026"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Event Day</label>
                    <input
                      type="text"
                      value={eventDay}
                      onChange={(e) => setEventDay(e.target.value)}
                      placeholder="e.g. THURSDAY"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider block">Event Time (IST)</label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Reveal Date & Time on Website</label>
                    <span className="text-[9px] text-white/30 block">Toggle off to show &apos;ANNOUNCING SOON&apos; globally</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealDate(!revealDate)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      revealDate ? "bg-ted-red" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        revealDate ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Row 3: Countdown target controls */}
              <div className="md:col-span-2 border border-white/10 p-6 rounded-2xl bg-black/40 space-y-4">
                <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Countdown Settings"}</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Target Countdown Timestamp (ISO 8601)</label>
                    <span className="text-[9px] text-white/30">Format: YYYY-MM-DDTHH:MM:SS</span>
                  </div>
                  <input
                    type="text"
                    value={countdownTarget}
                    onChange={(e) => setCountdownTarget(e.target.value)}
                    placeholder="e.g. 2026-10-15T09:00:00"
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white font-mono focus:outline-none focus:border-ted-red transition-colors rounded-lg"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Reveal Countdown Timer</label>
                    <span className="text-[9px] text-white/30 block">Toggle off to hide timer numbers on website</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealCountdown(!revealCountdown)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      revealCountdown ? "bg-ted-red" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        revealCountdown ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* About Section Config */}
              <div className="md:col-span-2 border border-white/10 p-6 rounded-2xl bg-black/40 space-y-4">
                <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// About Section Config"}</span>
                
                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider block">About Theme Name</label>
                  <input
                    type="text"
                    value={aboutThemeName}
                    onChange={(e) => setAboutThemeName(e.target.value)}
                    placeholder="e.g. TRANSFORMING PERSPECTIVES"
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider block">About Theme Description</label>
                  <textarea
                    value={aboutThemeDesc}
                    onChange={(e) => setAboutThemeDesc(e.target.value)}
                    placeholder="e.g. This year, we invite speakers who challenge the baseline of conventional frameworks..."
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-sans h-28 resize-y"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Reveal About Theme & Description</label>
                    <span className="text-[9px] text-white/30 block">Toggle off to show &apos;THEME REVEALING SOON&apos; and generic text on the About page</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealAboutTheme(!revealAboutTheme)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      revealAboutTheme ? "bg-ted-red" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        revealAboutTheme ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Reveal Team Section</label>
                    <span className="text-[9px] text-white/30 block">Toggle off to show &apos;THE FACES BEHIND THE EXPERIENCE - COMING SOON&apos; placeholder on website</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealTeam(!revealTeam)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      revealTeam ? "bg-ted-red" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        revealTeam ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Reveal Speakers Section</label>
                    <span className="text-[9px] text-white/30 block">Toggle off to show &apos;Speaker Lineup Coming Soon&apos; placeholder on website</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealSpeakers(!revealSpeakers)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      revealSpeakers ? "bg-ted-red" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        revealSpeakers ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Reveal Partners Section</label>
                    <span className="text-[9px] text-white/30 block">Toggle off to show &apos;THE JOURNEY TAKES SHAPE SOON&apos; placeholder on website</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealPartners(!revealPartners)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      revealPartners ? "bg-ted-red" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        revealPartners ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Reveal &apos;Register Now&apos; Tab</label>
                    <span className="text-[9px] text-white/30 block">Toggle off to hide the registration intake form navigation tab globally</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealRegister(!revealRegister)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      revealRegister ? "bg-ted-red" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        revealRegister ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Reveal &apos;Get My Pass&apos; Tab</label>
                    <span className="text-[9px] text-white/30 block">Toggle off to hide the ticket pass downloader navigation tab globally</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealTickets(!revealTickets)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      revealTickets ? "bg-ted-red" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        revealTickets ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Schedule Section Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Reveal Event Schedule Section</label>
                    <span className="text-[9px] text-white/30 block">Toggle off to show &apos;THE JOURNEY TAKES SHAPE SOON&apos; placeholder on the Schedule section</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealSchedule(!revealSchedule)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      revealSchedule ? "bg-ted-red" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                        revealSchedule ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Standalone instant-save Schedule toggle card */}
            <div className="border border-white/10 p-5 rounded-2xl bg-black/40 flex items-center justify-between font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Schedule Visibility"}</span>
                <label className="text-xs font-bold text-white uppercase tracking-wider block">Quick Toggle — Reveal Event Schedule</label>
                <span className="text-[9px] text-white/30 block">
                  {revealSchedule
                    ? "Currently showing full event schedule timeline on website"
                    : "Currently hiding schedule — showing 'CHRONOLOGY LOCKED' placeholder globally"
                  }
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleScheduleReveal}
                className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                  revealSchedule ? "bg-ted-red" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                    revealSchedule ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-8 py-3 bg-ted-red hover:bg-white text-white hover:text-black font-black uppercase text-xs tracking-widest transition-all duration-300 rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2 border border-ted-red"
              >
                {savingSettings ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Commit Settings"
                )}
              </button>
            </div>
          </form>
        ) : activeSubTab === "team" ? (
          /* TEAM MANAGER VIEW */
          <div className="space-y-8 font-mono text-xs">
            {/* Visibility toggle control card */}
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Visibility Controls"}</span>
                <label className="text-sm font-bold text-white uppercase tracking-wider block">Reveal Team Section on Website</label>
                <span className="text-[9px] text-white/30 block">
                  {revealTeam 
                    ? "Currently showing committee profiles on About page" 
                    : "Currently showing 'THE FACES BEHIND THE EXPERIENCE - COMING SOON' placeholder"
                  }
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleTeamReveal}
                className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                  revealTeam ? "bg-ted-red" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                    revealTeam ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Editor panel: Add / Edit Team Member */}
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 space-y-4">
              <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">
                {editingMemberId ? `// Edit Team Member Profile` : `// Add New Team Member`}
              </span>
              
              <form onSubmit={handleSaveMember} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      placeholder="e.g. Kavya Menon"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Role / Designation</label>
                    <input
                      type="text"
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      placeholder="e.g. Design & Tech Lead"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Gmail Address (Optional)</label>
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="e.g. kavya@tedxgcem.com"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">LinkedIn Profile URL (Optional)</label>
                    <input
                      type="url"
                      value={memberLinkedin}
                      onChange={(e) => setMemberLinkedin(e.target.value)}
                      placeholder="e.g. https://linkedin.com/in/kavya"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider block">Biography Description (Editable Card Backface)</label>
                  <textarea
                    value={memberBio}
                    onChange={(e) => setMemberBio(e.target.value)}
                    placeholder="Provide a bio description for the flipped side of the card..."
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-sans h-24 resize-y leading-relaxed"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Upload Profile Headshot</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full bg-white/5 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-mono cursor-pointer"
                    />
                    <span className="text-[9px] text-white/30 block">Select a square photo from your computer (under 2MB)</span>
                  </div>

                  {memberImageUrl && (
                    <div className="flex items-center gap-4 border border-white/5 bg-black/30 p-3 rounded-xl">
                      <div className="w-16 h-16 rounded border border-white/20 overflow-hidden shrink-0 bg-zinc-950">
                        <img src={memberImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-white uppercase block">Image Preview</span>
                        <button
                          type="button"
                          onClick={() => setMemberImageUrl("")}
                          className="text-[9px] text-ted-red hover:underline uppercase font-bold cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  {editingMemberId && (
                    <button
                      type="button"
                      onClick={handleResetMemberForm}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] transition-colors rounded-lg cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingMember}
                    className="px-6 py-2.5 bg-ted-red hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-[10px] transition-colors rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingMember ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving Member...
                      </>
                    ) : editingMemberId ? (
                      "Update Profile"
                    ) : (
                      "Add Member"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List/Table panel: Current Team Members */}
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 space-y-4">
              <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Organizing Committee Members"}</span>
              
              {teamMembers.length === 0 ? (
                <p className="text-center text-white/40 py-8 font-mono">No team members registered. Add members above.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex gap-4 border border-white/5 bg-black/20 p-4 rounded-xl items-start relative group"
                    >
                      <div className="w-16 h-16 border border-white/15 overflow-hidden shrink-0 bg-zinc-950">
                        {member.image_url ? (
                          <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 font-bold bg-white/5 text-[9px] uppercase">
                            No Photo
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-grow pr-16">
                        <div className="space-y-0.5">
                          <h5 className="font-bold text-white uppercase tracking-wider text-sm">{member.name}</h5>
                          <div className="text-[10px] text-ted-red uppercase tracking-widest">{member.role}</div>
                        </div>
                        
                        <div className="flex gap-2.5 pt-0.5">
                          {member.email ? (
                            <span className="text-[9px] text-white/50 bg-white/5 px-2 py-0.5 rounded font-mono" title={member.email}>
                              ✉️ Email
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/20 bg-white/[0.02] px-2 py-0.5 rounded font-mono line-through">
                              ✉️ Email
                            </span>
                          )}
                          {member.linkedin ? (
                            <span className="text-[9px] text-white/50 bg-white/5 px-2 py-0.5 rounded font-mono" title={member.linkedin}>
                              🔗 LinkedIn
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/20 bg-white/[0.02] px-2 py-0.5 rounded font-mono line-through">
                              🔗 LinkedIn
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-white/40 leading-relaxed font-sans line-clamp-2 max-w-sm" title={member.bio}>
                          {member.bio}
                        </p>
                      </div>

                      <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="p-1.5 bg-white/5 border border-white/10 hover:bg-ted-red/20 hover:border-ted-red text-white hover:text-white rounded transition-colors cursor-pointer animate-none"
                          title="Edit Profile"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1.5 bg-white/5 border border-white/10 hover:bg-ted-red hover:text-white text-white rounded transition-colors cursor-pointer animate-none"
                          title="Delete Member"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeSubTab === "speakers" ? (
          /* SPEAKERS MANAGER VIEW */
          <div className="space-y-8 font-mono text-xs">
            {/* Visibility toggle control card */}
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Visibility Controls"}</span>
                <label className="text-sm font-bold text-white uppercase tracking-wider block">Reveal Speakers Section on Website</label>
                <span className="text-[9px] text-white/30 block">
                  {revealSpeakers 
                    ? "Currently showing speakers lineup on website" 
                    : "Currently showing 'Speaker Lineup Coming Soon' placeholder"
                  }
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleSpeakersReveal}
                className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                  revealSpeakers ? "bg-ted-red" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                    revealSpeakers ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Editor panel: Add / Edit Speaker */}
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 space-y-4">
              <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">
                {editingSpeakerId ? `// Edit Speaker Profile` : `// Add New Speaker`}
              </span>
              
              <form onSubmit={handleSaveSpeaker} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={speakerName}
                      onChange={(e) => setSpeakerName(e.target.value)}
                      placeholder="e.g. Dr. Sarah Chen"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Designation / Role</label>
                    <input
                      type="text"
                      value={speakerDesignation}
                      onChange={(e) => setSpeakerDesignation(e.target.value)}
                      placeholder="e.g. AI Ethics Researcher"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Gmail Address (Optional)</label>
                    <input
                      type="email"
                      value={speakerEmail}
                      onChange={(e) => setSpeakerEmail(e.target.value)}
                      placeholder="e.g. sarah.chen@tedxgcem.com"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">LinkedIn Profile URL (Optional)</label>
                    <input
                      type="url"
                      value={speakerLinkedin}
                      onChange={(e) => setSpeakerLinkedin(e.target.value)}
                      placeholder="e.g. https://linkedin.com/in/sarah"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Instagram Profile URL (Optional)</label>
                    <input
                      type="url"
                      value={speakerInstagram}
                      onChange={(e) => setSpeakerInstagram(e.target.value)}
                      placeholder="e.g. https://instagram.com/sarah"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider block">Talk Description / Short Bio</label>
                  <textarea
                    value={speakerBio}
                    onChange={(e) => setSpeakerBio(e.target.value)}
                    placeholder="Provide a short description of the talk topic and speaker profile..."
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-sans h-24 resize-y leading-relaxed"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider block">Detailed Credentials / Background</label>
                  <textarea
                    value={speakerDetails}
                    onChange={(e) => setSpeakerDetails(e.target.value)}
                    placeholder="Provide detailed background, achievements, and credentials..."
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-sans h-20 resize-y leading-relaxed"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Upload Speaker Headshot</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSpeakerImageChange}
                      className="w-full bg-white/5 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-mono cursor-pointer"
                    />
                    <span className="text-[9px] text-white/30 block">Select a high-quality square speaker headshot (under 2MB)</span>
                  </div>

                  {speakerImageUrl && (
                    <div className="flex items-center gap-4 border border-white/5 bg-black/30 p-3 rounded-xl">
                      <div className="w-16 h-16 rounded border border-white/20 overflow-hidden shrink-0 bg-zinc-950">
                        <img src={speakerImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-white uppercase block">Image Preview</span>
                        <button
                          type="button"
                          onClick={() => setSpeakerImageUrl("")}
                          className="text-[9px] text-ted-red hover:underline uppercase font-bold cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  {editingSpeakerId && (
                    <button
                      type="button"
                      onClick={handleResetSpeakerForm}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] transition-colors rounded-lg cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingSpeaker}
                    className="px-6 py-2.5 bg-ted-red hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-[10px] transition-colors rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingSpeaker ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving Speaker...
                      </>
                    ) : editingSpeakerId ? (
                      "Update Profile"
                    ) : (
                      "Add Speaker"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List/Table panel: Current Speakers */}
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 space-y-4">
              <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Registered Featured Speakers"}</span>
              
              {speakersList.length === 0 ? (
                <p className="text-center text-white/40 py-8 font-mono">No speakers registered. Add speakers above.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {speakersList.map((speaker) => (
                    <div
                      key={speaker.id}
                      className="flex gap-4 border border-white/5 bg-black/20 p-4 rounded-xl items-start relative group"
                    >
                      <div className="w-16 h-20 border border-white/15 overflow-hidden shrink-0 bg-zinc-950">
                        {speaker.image_url ? (
                          <img src={speaker.image_url} alt={speaker.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 font-bold bg-white/5 text-[9px] uppercase">
                            No Photo
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-grow pr-16">
                        <div className="space-y-0.5">
                          <h5 className="font-bold text-white uppercase tracking-wider text-sm">{speaker.name}</h5>
                          <div className="text-[10px] text-ted-red uppercase tracking-widest">{speaker.designation}</div>
                        </div>
                        
                        <div className="flex gap-2.5 pt-0.5">
                          {speaker.email ? (
                            <span className="text-[9px] text-white/50 bg-white/5 px-2 py-0.5 rounded font-mono" title={speaker.email}>
                              ✉️ Email
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/20 bg-white/[0.02] px-2 py-0.5 rounded font-mono line-through">
                              ✉️ Email
                            </span>
                          )}
                          {speaker.linkedin ? (
                            <span className="text-[9px] text-white/50 bg-white/5 px-2 py-0.5 rounded font-mono" title={speaker.linkedin}>
                              🔗 LinkedIn
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/20 bg-white/[0.02] px-2 py-0.5 rounded font-mono line-through">
                              🔗 LinkedIn
                            </span>
                          )}
                          {speaker.instagram ? (
                            <span className="text-[9px] text-white/50 bg-white/5 px-2 py-0.5 rounded font-mono" title={speaker.instagram}>
                              📸 Instagram
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/20 bg-white/[0.02] px-2 py-0.5 rounded font-mono line-through">
                              📸 Instagram
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-white/40 leading-relaxed font-sans line-clamp-2 max-w-sm" title={speaker.bio}>
                          {speaker.bio}
                        </p>
                      </div>

                      <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditSpeaker(speaker)}
                          className="p-1.5 bg-white/5 border border-white/10 hover:bg-ted-red/20 hover:border-ted-red text-white hover:text-white rounded transition-colors cursor-pointer animate-none"
                          title="Edit Profile"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSpeaker(speaker.id)}
                          className="p-1.5 bg-white/5 border border-white/10 hover:bg-ted-red hover:text-white text-white rounded transition-colors cursor-pointer animate-none"
                          title="Delete Speaker"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeSubTab === "partners" ? (
          /* PARTNERS MANAGER VIEW */
          <div className="space-y-8 font-mono text-xs">
            {/* Visibility toggle control card */}
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Visibility Controls"}</span>
                <label className="text-sm font-bold text-white uppercase tracking-wider block">Reveal Partners Section on Website</label>
                <span className="text-[9px] text-white/30 block">
                  {revealPartners 
                    ? "Currently showing partners section on website" 
                    : "Currently showing 'THE JOURNEY TAKES SHAPE SOON' placeholder"
                  }
                </span>
              </div>
              <button
                type="button"
                onClick={handleTogglePartnersReveal}
                className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                  revealPartners ? "bg-ted-red" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                    revealPartners ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Editor panel: Add / Edit Partner */}
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 space-y-4">
              <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">
                {editingPartnerId ? `// Edit Partner Profile` : `// Add New Partner`}
              </span>
              
              <form onSubmit={handleSavePartner} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Partner / Sponsor Name</label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Global Tech Corp"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Partner Role / Title (displayed above logo)</label>
                    <input
                      type="text"
                      value={partnerRole}
                      onChange={(e) => setPartnerRole(e.target.value)}
                      placeholder="e.g. Hydration Partner"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="e.g. sponsor@company.com"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider block">Description / Bio</label>
                  <input
                    type="text"
                    value={partnerDescription}
                    onChange={(e) => setPartnerDescription(e.target.value)}
                    placeholder="Provide brief details about this partnership..."
                    className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider block">Upload Partner Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePartnerLogoChange}
                      className="w-full bg-white/5 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-ted-red transition-colors rounded-lg font-mono cursor-pointer"
                    />
                    <span className="text-[9px] text-white/30 block">Select a partner logo image from your computer (under 2MB)</span>
                  </div>

                  {partnerLogoUrl && (
                    <div className="flex items-center gap-4 border border-white/5 bg-black/30 p-3 rounded-xl">
                      <div className="w-16 h-16 rounded border border-white/20 overflow-hidden shrink-0 bg-white p-1 flex items-center justify-center">
                        <img src={partnerLogoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-white uppercase block">Logo Preview</span>
                        <button
                          type="button"
                          onClick={() => setPartnerLogoUrl("")}
                          className="text-[9px] text-ted-red hover:underline uppercase font-bold cursor-pointer"
                        >
                          Remove Logo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  {editingPartnerId && (
                    <button
                      type="button"
                      onClick={handleResetPartnerForm}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] transition-colors rounded-lg cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingPartner}
                    className="px-6 py-2.5 bg-ted-red hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-[10px] transition-colors rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingPartner ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving Partner...
                      </>
                    ) : editingPartnerId ? (
                      "Update Partner"
                    ) : (
                      "Add Partner"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List/Table panel: Current Partners */}
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 space-y-4">
              <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Event Partners & Sponsors"}</span>
              
              {partnersList.length === 0 ? (
                <p className="text-center text-white/40 py-8 font-mono">No partners registered. Add partners above.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnersList.map((partner) => (
                    <div
                      key={partner.id}
                      className="flex gap-4 border border-white/5 bg-black/20 p-4 rounded-xl items-start relative group"
                    >
                      <div className="w-16 h-16 border border-white/15 overflow-hidden shrink-0 bg-white p-1 flex items-center justify-center">
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 font-bold bg-white/5 text-[9px] uppercase">
                            No Logo
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-grow pr-16">
                        <div className="space-y-0.5">
                          <h5 className="font-bold text-white uppercase tracking-wider text-sm">{partner.name}</h5>
                          <div className="text-[10px] text-ted-red uppercase tracking-widest">{partner.role}</div>
                        </div>
                        
                        <div className="flex gap-2.5 pt-0.5">
                          {partner.email ? (
                            <span className="text-[9px] text-white/50 bg-white/5 px-2 py-0.5 rounded font-mono" title={partner.email}>
                              ✉️ Email
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/20 bg-white/[0.02] px-2 py-0.5 rounded font-mono line-through">
                              ✉️ Email
                            </span>
                          )}
                          {partner.phone ? (
                            <span className="text-[9px] text-white/50 bg-white/5 px-2 py-0.5 rounded font-mono" title={partner.phone}>
                              📞 Phone
                            </span>
                          ) : (
                            <span className="text-[9px] text-white/20 bg-white/[0.02] px-2 py-0.5 rounded font-mono line-through">
                              📞 Phone
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-white/40 leading-relaxed font-sans line-clamp-2 max-w-sm" title={partner.description}>
                          {partner.description}
                        </p>
                      </div>

                      <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditPartner(partner)}
                          className="p-1.5 bg-white/5 border border-white/10 hover:bg-ted-red/20 hover:border-ted-red text-white hover:text-white rounded transition-colors cursor-pointer animate-none"
                          title="Edit Partner"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner.id)}
                          className="p-1.5 bg-white/5 border border-white/10 hover:bg-ted-red hover:text-white text-white rounded transition-colors cursor-pointer animate-none"
                          title="Delete Partner"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeSubTab === "scanner" ? (
          /* SCANNER SUBTAB VIEW */
          <div className="space-y-8 font-mono">
            <div className="border border-white/10 p-6 rounded-2xl bg-black/40 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] text-ted-red uppercase tracking-widest font-black block">{"// Event Day Control"}</span>
                  <h4 className="text-xl font-bold text-white uppercase tracking-tight">Admin Ticket Scanner & Entry Control</h4>
                  <p className="text-xs text-white/40 mt-1">Scan delegate pass QR code via camera or enter Pass ID / Email manually to verify payment & grant venue access.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScanningCamera(!isScanningCamera)}
                  className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    isScanningCamera ? "bg-ted-red text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <span>📷</span>
                  {isScanningCamera ? "Stop Camera" : "Start Camera Scanner"}
                </button>
              </div>

              {/* Camera Scanner Viewport */}
              {isScanningCamera && (
                <div className="p-4 bg-black border border-ted-red/30 rounded-2xl flex flex-col items-center justify-center space-y-3">
                  <span className="text-xs text-ted-red font-bold animate-pulse">● CAMERA LIVE — POINT QR CODE AT CAMERA</span>
                  <div id="admin-camera-reader" className="w-full max-w-sm rounded-xl overflow-hidden bg-zinc-900 border border-white/10 min-h-[250px]" />
                </div>
              )}

              {/* Manual Pass ID / Email Lookup Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!scanSearchInput.trim()) return;
                  const query = scanSearchInput.trim().toLowerCase();
                  const found = registrations.find(
                    (r) =>
                      r.id.toLowerCase().includes(query.replace("tedx-", "")) ||
                      r.email.toLowerCase().includes(query) ||
                      r.full_name.toLowerCase().includes(query)
                  );
                  if (found) {
                    setScanMatchedReg(found);
                    setScanMessage(null);
                  } else {
                    setScanMatchedReg(null);
                    setScanMessage("No registration record found matching: " + scanSearchInput);
                  }
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  value={scanSearchInput}
                  onChange={(e) => setScanSearchInput(e.target.value)}
                  placeholder="Enter Pass ID (e.g. TEDX-27197CEA), Email, or Name..."
                  className="flex-grow bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-ted-red transition-colors rounded-xl font-bold"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-ted-red hover:bg-white hover:text-ted-red text-white font-bold uppercase text-xs tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Verify Ticket
                </button>
              </form>

              {scanMessage && (
                <div className="p-4 bg-ted-red/10 border border-ted-red/30 rounded-xl text-ted-red text-xs font-bold">
                  {scanMessage}
                </div>
              )}

              {/* Verification Result Card */}
              {scanMatchedReg && (
                <div className="border-2 border-white/20 bg-black/60 p-6 md:p-8 rounded-2xl space-y-6 relative overflow-hidden">
                  <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">ATTENDEE DELEGATE</span>
                      <h3 className="text-2xl font-black text-white uppercase">{scanMatchedReg.full_name}</h3>
                      {scanMatchedReg.designation && (
                        <span className="text-xs text-ted-red font-bold uppercase block mt-0.5">● {scanMatchedReg.designation}</span>
                      )}
                    </div>
                    <div className="text-right">
                      {scanMatchedReg.ticket_status === "confirmed" || scanMatchedReg.ticket_status === "approved" || !!scanMatchedReg.razorpay_payment_id || !!scanMatchedReg.payment_id ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          Confirmed / Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                          Unpaid / Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] text-white/40 block">EMAIL ADDRESS</span>
                      <span className="text-white font-bold">{scanMatchedReg.email}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 block">PHONE</span>
                      <span className="text-ted-red font-bold">{scanMatchedReg.phone}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 block">INSTITUTION</span>
                      <span className="text-white font-bold uppercase">{scanMatchedReg.organization}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-white/10">
                    <div>
                      <span className="text-[9px] text-white/40 block">RAZORPAY PAYMENT ID</span>
                      <span className="text-ted-red font-bold font-mono">{scanMatchedReg.razorpay_payment_id || scanMatchedReg.payment_id || "No Record"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 block">UTR NUMBER</span>
                      <span className="text-white font-bold font-mono">{scanMatchedReg.utr_number || "N/A"}</span>
                    </div>
                  </div>

                  {/* Entry Action Button */}
                  <div className="pt-4 flex items-center justify-between border-t border-white/10">
                    <span className="text-xs text-white/50">Ticket Pass ID: <strong className="text-white">TEDX-{scanMatchedReg.id.slice(0, 8).toUpperCase()}</strong></span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/admin/registrations", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: scanMatchedReg.id, ticketStatus: "checked_in" }),
                          });
                          if (res.ok) {
                            alert(`✅ ENTRY GRANTED! ${scanMatchedReg.full_name} has been marked checked-in.`);
                            fetchData();
                          }
                        } catch {
                          alert("Failed to update status.");
                        }
                      }}
                      className="px-6 py-3 bg-green-500 text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-white transition-all cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    >
                      ✓ Grant Entry & Mark Checked-In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
