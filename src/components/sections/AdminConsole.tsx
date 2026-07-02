"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { TeamMember } from "@/lib/team-service";
import { Speaker } from "@/lib/speakers-service";
import { Partner } from "@/lib/partners-service";
import { EventSettings } from "@/lib/settings-service";

interface AdminRegistration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  linkedin: string;
  ticket_status: string;
  created_at: string;
  payment_id?: string | null;
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

export default function AdminConsole({ settings, onSettingsUpdate }: AdminConsoleProps) {
  const { isAdmin, loading: authLoading } = useAuth();
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [speakersList, setSpeakersList] = useState<Speaker[]>([]);
  const [partnersList, setPartnersList] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"registrations" | "messages" | "settings" | "team" | "speakers" | "partners">("registrations");
  const [errorMsg, setErrorMsg] = useState("");

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
    }
  }, [settings]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Fetch registrations
      const regRes = await fetch("/api/admin/registrations");
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.error || "Failed to load registrations.");
      setRegistrations(regData.registrations || []);

      // Fetch messages
      const msgRes = await fetch("/api/admin/messages");
      const msgData = await msgRes.json();
      if (!msgRes.ok) throw new Error(msgData.error || "Failed to load inbox messages.");
      setMessages(msgData.messages || []);

      // Fetch team members
      const teamRes = await fetch("/api/team");
      const teamData = await teamRes.json();
      if (!teamRes.ok) throw new Error(teamData.error || "Failed to load team members.");
      setTeamMembers(teamData.team || []);

      // Fetch speakers
      const speakersRes = await fetch("/api/speakers");
      const speakersData = await speakersRes.json();
      if (!speakersRes.ok) throw new Error(speakersData.error || "Failed to load speakers.");
      setSpeakersList(speakersData.speakers || []);

      // Fetch partners
      const partnersRes = await fetch("/api/partners");
      const partnersData = await partnersRes.json();
      if (!partnersRes.ok) throw new Error(partnersData.error || "Failed to load partners.");
      setPartnersList(partnersData.partners || []);
    } catch (err: unknown) {
      console.error("Error loading admin records:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load database records. Ensure database setup is correct.";
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
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
      const timer = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAdmin]);



  const deleteRegistration = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this registration?")) return;
    try {
      const res = await fetch(`/api/admin/registrations?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete record.");

      setRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error deleting registration: " + errorMessage);
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
          onClick={fetchData}
          disabled={loading}
          className="md:ml-auto px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.5" />
          </svg>
          Reload
        </button>
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

            <div className="overflow-x-auto">
              {registrations.length === 0 ? (
                <p className="text-center text-white/40 py-16 font-mono text-sm">No registrations recorded yet.</p>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 font-mono uppercase tracking-wider">
                      <th className="pb-4 pr-4">Name</th>
                      <th className="pb-4 px-4">Contact Info</th>
                      <th className="pb-4 px-4">Organization</th>
                      <th className="pb-4 px-4">LinkedIn</th>
                      <th className="pb-4 px-4">Payment ID</th>
                      <th className="pb-4 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 pr-4 font-bold text-white uppercase tracking-wider">{reg.full_name}</td>
                        <td className="py-4 px-4 space-y-1">
                          <div className="text-white/80">{reg.email}</div>
                          <div className="text-white/40 font-mono">{reg.phone}</div>
                        </td>
                        <td className="py-4 px-4 uppercase text-white/80">{reg.organization}</td>
                        <td className="py-4 px-4">
                          {reg.linkedin ? (
                            <a href={reg.linkedin} target="_blank" rel="noopener noreferrer" className="text-ted-red hover:underline font-mono">
                              View URL
                            </a>
                          ) : (
                            <span className="text-white/20 font-mono">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono text-white/70">
                          {reg.payment_id || <span className="text-white/25">No Payment</span>}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          <button
                            type="button"
                            onClick={() => deleteRegistration(reg.id)}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-ted-red hover:text-white rounded-lg uppercase text-white/50 cursor-pointer font-bold transition-all"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
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
              </div>
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
        ) : (
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
        )}
      </div>
    </section>
  );
}
