"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabId } from "@/components/ui/TabNav";

interface RegisterNowProps {
  onTabChange: (id: TabId) => void;
}

export default function RegisterNow({ onTabChange }: RegisterNowProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    linkedin: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,14}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (minimum 10 digits)";
    }
    
    if (!formData.organization.trim()) newErrors.organization = "College / Organization is required";
    
    // Validate LinkedIn URL format only if provided
    if (formData.linkedin.trim() && !/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i.test(formData.linkedin.trim())) {
      newErrors.linkedin = "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col">
      {/* Hero Banner Manifesto */}
      <div className="w-full mb-24 flex flex-col justify-between items-start gap-6 border-b border-white/10 pb-16">
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
          Secure your spot at TEDxGCEM 2026. Limited seats are available for selected applicants. Apply now to be part of the experience.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-ted-dark-gray/50 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm relative overflow-hidden"
      >
        {/* Decorative Glow */}
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-ted-red/10 blur-[80px] rounded-full" />
        
        {!isSuccess ? (
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="relative z-10 space-y-10 py-2"
              >
                {/* Top Badge */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ted-red/10 border border-ted-red/20 text-ted-red text-[11px] uppercase tracking-[0.2em] font-black font-mono shadow-[0_0_15px_rgba(235,0,40,0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-ted-red animate-pulse" />
                    Pass Application Open
                  </span>
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
                    TEDxGCEM 2026 is more than a stage. It&apos;s a convergence of visionaries, catalysts, and innovators pushing the boundaries of what is possible. Join us for a day filled with mind-expanding talks, electrifying performances, and networking opportunities that could redefine your trajectory.
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
                  <button
                    onClick={() => setShowForm(true)}
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
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    LIVE NOW
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                onSubmit={handleSubmit}
                className="relative z-10 space-y-8"
              >
                {/* Form Back Button & Progress */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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
                  <span className="text-[10px] uppercase tracking-widest font-mono text-ted-red font-black">
                    Step 2 of 2: Details
                  </span>
                </div>

                <div className="text-center mb-6">
                  <p className="text-white/60">
                    Complete the form below to register for <span className="text-ted-red uppercase font-bold">TED</span><span className="text-ted-red lowercase font-bold">x</span><span className="text-white uppercase font-bold">GCEM</span> 2026. Limited seats available.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe" 
                      className={`w-full bg-black/40 border ${errors.fullName ? 'border-ted-red' : 'border-white/10'} rounded-2xl px-6 py-4 outline-none focus:border-ted-red focus:shadow-[0_0_15px_rgba(235,0,40,0.1)] transition-all text-white`}
                    />
                    {errors.fullName && <p className="text-ted-red text-[11px] ml-4 font-semibold">{errors.fullName}</p>}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com" 
                      className={`w-full bg-black/40 border ${errors.email ? 'border-ted-red' : 'border-white/10'} rounded-2xl px-6 py-4 outline-none focus:border-ted-red focus:shadow-[0_0_15px_rgba(235,0,40,0.1)] transition-all text-white`}
                    />
                    {errors.email && <p className="text-ted-red text-[11px] ml-4 font-semibold">{errors.email}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210" 
                      className={`w-full bg-black/40 border ${errors.phone ? 'border-ted-red' : 'border-white/10'} rounded-2xl px-6 py-4 outline-none focus:border-ted-red focus:shadow-[0_0_15px_rgba(235,0,40,0.1)] transition-all text-white`}
                    />
                    {errors.phone && <p className="text-ted-red text-[11px] ml-4 font-semibold">{errors.phone}</p>}
                  </div>

                  {/* Organization */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">Organization / College</label>
                    <input 
                      type="text" 
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="GCEM" 
                      className={`w-full bg-black/40 border ${errors.organization ? 'border-ted-red' : 'border-white/10'} rounded-2xl px-6 py-4 outline-none focus:border-ted-red focus:shadow-[0_0_15px_rgba(235,0,40,0.1)] transition-all text-white`}
                    />
                    {errors.organization && <p className="text-ted-red text-[11px] ml-4 font-semibold">{errors.organization}</p>}
                  </div>
                </div>

                {/* LinkedIn Profile */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">LinkedIn Profile (Optional)</label>
                  <input 
                    type="url" 
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username" 
                    className={`w-full bg-black/40 border ${errors.linkedin ? 'border-ted-red' : 'border-white/10'} rounded-2xl px-6 py-4 outline-none focus:border-ted-red focus:shadow-[0_0_15px_rgba(235,0,40,0.1)] transition-all text-white`}
                  />
                  {errors.linkedin && <p className="text-ted-red text-[11px] ml-4 font-semibold">{errors.linkedin}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-ted-red text-white font-black rounded-2xl text-lg shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.5)] transition-all uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center space-y-8 py-6"
          >
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>

            <div>
              <h4 className="text-3xl font-black mb-3">Registration Submitted!</h4>
              <p className="text-white/60 max-w-md mx-auto">
                Thank you for registering, <span className="text-white font-bold">{formData.fullName}</span>. We are processing your request. Keep an eye on your inbox (<span className="text-ted-red font-medium">{formData.email}</span>) for your entry pass.
              </p>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 max-w-sm mx-auto text-left space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                <span className="text-white/40">Status</span>
                <span className="text-green-500 font-bold uppercase tracking-wider">Pending Approval</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                <span className="text-white/40">Ticket Type</span>
                <span className="text-white font-bold">Attendee Pass</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Institution</span>
                <span className="text-white font-bold">{formData.organization}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={() => onTabChange("get-pass")}
                className="px-8 py-4.5 bg-ted-red border border-ted-red text-white font-black rounded-2xl text-base shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:bg-white hover:text-ted-red transition-all uppercase tracking-widest cursor-pointer"
              >
                Access Passes Tab
              </button>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setShowForm(false);
                  setFormData({ fullName: "", email: "", phone: "", organization: "", linkedin: "" });
                }}
                className="px-8 py-4.5 bg-transparent border border-white/10 text-white/60 font-bold rounded-2xl text-base hover:bg-white/5 transition-all uppercase tracking-widest cursor-pointer"
              >
                New Register
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
