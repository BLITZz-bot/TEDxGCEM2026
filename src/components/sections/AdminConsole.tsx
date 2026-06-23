"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AdminRegistration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  linkedin: string;
  ticket_status: string;
  created_at: string;
}

interface AdminMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface AdminConsoleProps {
  settings: {
    theme_name: string;
    reveal_theme: boolean;
    reveal_date: boolean;
    reveal_countdown: boolean;
    event_date: string;
    event_time: string;
    event_day: string;
    countdown_target: string;
  } | null;
  onSettingsUpdate: () => void;
}

export default function AdminConsole({ settings, onSettingsUpdate }: AdminConsoleProps) {
  const { isAdmin, loading: authLoading } = useAuth();
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"registrations" | "messages" | "settings">("registrations");
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
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

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
    } catch (err: unknown) {
      console.error("Error loading admin records:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load database records. Ensure backend setup is correct.";
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

  useEffect(() => {
    if (isAdmin) {
      const timer = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ticketStatus: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update record.");

      setRegistrations(prev => 
        prev.map(r => r.id === id ? { ...r, ticket_status: newStatus } : r)
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      alert("Error updating status: " + errorMessage);
    }
  };

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
  const confirmedCount = registrations.filter(r => r.ticket_status === "confirmed" || r.ticket_status === "approved").length;
  const pendingCount = totalRegistrations - confirmedCount;
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-ted-dark-gray/30 border border-white/5 p-6 rounded-2xl">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-1">Total Registers</span>
          <span className="text-3xl font-black text-white">{totalRegistrations}</span>
        </div>
        <div className="bg-ted-dark-gray/30 border border-white/5 p-6 rounded-2xl">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-1">Confirmed passes</span>
          <span className="text-3xl font-black text-green-500">{confirmedCount}</span>
        </div>
        <div className="bg-ted-dark-gray/30 border border-white/5 p-6 rounded-2xl">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-1">Pending Approvals</span>
          <span className="text-3xl font-black text-yellow-500">{pendingCount}</span>
        </div>
        <div className="bg-ted-dark-gray/30 border border-white/5 p-6 rounded-2xl">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-1">Total Inbox Messages</span>
          <span className="text-3xl font-black text-white">{totalMessages}</span>
        </div>
      </div>

      {/* Subtab Switcher */}
      <div className="flex flex-wrap gap-3 border-b border-white/5 pb-4 mb-6">
        <button
          onClick={() => setActiveSubTab("registrations")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeSubTab === "registrations" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Registrations ({totalRegistrations})
        </button>
        <button
          onClick={() => setActiveSubTab("messages")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeSubTab === "messages" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Contact Messages ({totalMessages})
        </button>
        <button
          onClick={() => setActiveSubTab("settings")}
          className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeSubTab === "settings" ? "bg-ted-red text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Event Controls
        </button>
        <button
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
                    <th className="pb-4 px-4">Status</th>
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
                      <td className="py-4 px-4">
                        {reg.ticket_status === "confirmed" || reg.ticket_status === "approved" ? (
                          <span className="px-2 py-1 rounded bg-green-500/10 border border-green-500/25 text-green-500 font-mono text-[10px] uppercase font-bold">
                            Confirmed
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 font-mono text-[10px] uppercase font-bold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 pl-4 text-right space-x-2 whitespace-nowrap">
                        {reg.ticket_status !== "confirmed" && reg.ticket_status !== "approved" ? (
                          <button
                            onClick={() => updateStatus(reg.id, "confirmed")}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg uppercase cursor-pointer"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(reg.id, "pending_approval")}
                            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg uppercase cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => deleteRegistration(reg.id)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-ted-red hover:text-white rounded-lg uppercase text-white/50 cursor-pointer font-bold"
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
        ) : (
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
        )}
      </div>
    </section>
  );
}
