"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabId } from "@/components/ui/TabNav";
import { CreditCard, User, Mail, Phone, Building } from "lucide-react";

interface RegisterNowProps {
  onTabChange: (id: TabId) => void;
}

export default function RegisterNow({ onTabChange }: RegisterNowProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    motivation: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    if (!formData.organization.trim()) newErrors.organization = "Organization is required";
    if (!formData.motivation.trim()) newErrors.motivation = "Motivation is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-[0.2em] mb-2 font-mono">Join Us</h2>
        <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter">REGISTER NOW</h3>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Left panel: Registration Form */}
        <div className="lg:col-span-7 bg-ted-dark-gray border border-white/5 p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-mono flex items-center gap-1.5 ml-2">
                    <User size={12} /> Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full bg-black/50 border ${errors.fullName ? 'border-ted-red' : 'border-white/5'} rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all`}
                  />
                  {errors.fullName && <span className="text-ted-red text-[10px] ml-2">{errors.fullName}</span>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-mono flex items-center gap-1.5 ml-2">
                    <Mail size={12} /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full bg-black/50 border ${errors.email ? 'border-ted-red' : 'border-white/5'} rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all`}
                  />
                  {errors.email && <span className="text-ted-red text-[10px] ml-2">{errors.email}</span>}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-mono flex items-center gap-1.5 ml-2">
                    <Phone size={12} /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className={`w-full bg-black/50 border ${errors.phone ? 'border-ted-red' : 'border-white/5'} rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all`}
                  />
                  {errors.phone && <span className="text-ted-red text-[10px] ml-2">{errors.phone}</span>}
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-mono flex items-center gap-1.5 ml-2">
                    <Building size={12} /> College / Org
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="GCEM"
                    className={`w-full bg-black/50 border ${errors.organization ? 'border-ted-red' : 'border-white/5'} rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all`}
                  />
                  {errors.organization && <span className="text-ted-red text-[10px] ml-2">{errors.organization}</span>}
                </div>
              </div>

              {/* Motivation */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-mono ml-2">Why do you want to attend?</label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us what excites you about TEDxGCEM..."
                  className={`w-full bg-black/50 border ${errors.motivation ? 'border-ted-red' : 'border-white/5'} rounded-[1.5rem] px-6 py-4 outline-none focus:border-ted-red transition-all resize-none`}
                />
                {errors.motivation && <span className="text-ted-red text-[10px] ml-2">{errors.motivation}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-ted-red text-white font-black rounded-2xl hover:shadow-[0_0_30px_rgba(235,0,40,0.4)] transition-all uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Processing..." : "Submit Registration"}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-10"
            >
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h4 className="text-2xl font-black text-white">Registered Successfully!</h4>
              <p className="text-white/60 text-sm max-w-sm mx-auto">
                Thank you, {formData.fullName}. Check your inbox for the official entry pass soon.
              </p>
              <button 
                onClick={() => onTabChange("get-pass")}
                className="px-6 py-3 bg-ted-red text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Access Tickets Tab
              </button>
            </motion.div>
          )}
        </div>

        {/* Right panel: Real-time Ticket Preview */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center h-full">
          <motion.div
            layout
            className="w-full max-w-sm aspect-[1.6/1] bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-ted-red/20 via-black to-black border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative flex flex-col justify-between overflow-hidden"
          >
            {/* Hologram details */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-ted-red/10 blur-[30px] rounded-full" />
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <img src="/logo-white.png" alt="TEDx" className="h-4 w-auto" />
                <span className="text-white/40 text-[9px] uppercase tracking-widest font-mono font-bold mt-1">2026</span>
              </div>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono uppercase text-white/50 tracking-wider">
                Attendee
              </span>
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono block">Ticket Holder</span>
              <span className="text-lg font-black text-white block truncate h-7">
                {formData.fullName || "YOUR FULL NAME"}
              </span>
              <span className="text-xs font-bold text-ted-red block font-mono tracking-tight mt-1">
                {formData.organization.toUpperCase() || "INSTITUTION/COLLEGE"}
              </span>
            </div>

            <div className="flex justify-between items-end border-t border-white/5 pt-4">
              <div>
                <span className="text-[8px] uppercase tracking-widest text-white/30 font-mono block">Status</span>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider font-mono">
                  {isSuccess ? "Verified" : "Draft Ticket"}
                </span>
              </div>
              {/* Fake barcode block */}
              <div className="flex gap-0.5 opacity-20">
                <div className="w-1 h-6 bg-white" />
                <div className="w-0.5 h-6 bg-white" />
                <div className="w-2 h-6 bg-white" />
                <div className="w-1 h-6 bg-white" />
                <div className="w-0.5 h-6 bg-white" />
                <div className="w-1.5 h-6 bg-white" />
              </div>
            </div>
          </motion.div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/30 mt-4 block">
            Real-time Ticket Generation Matrix
          </span>
        </div>
      </div>
    </section>
  );
}
