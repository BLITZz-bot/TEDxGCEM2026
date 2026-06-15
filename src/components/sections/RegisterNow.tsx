"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,14}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (minimum 10 digits)";
    }
    
    if (!formData.organization.trim()) newErrors.organization = "College / Organization is required";
    if (!formData.motivation.trim()) newErrors.motivation = "Please tell us why you want to attend";
    
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
    <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-widest mb-2">Join the Conversation</h2>
        <h3 className="text-4xl md:text-6xl font-black italic uppercase">REGISTER NOW</h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-ted-dark-gray/50 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl backdrop-blur-sm relative overflow-hidden"
      >
        {/* Decorative Glow */}
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-ted-red/10 blur-[80px] rounded-full" />
        
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
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

            {/* Motivation */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 ml-4 font-bold">Why do you want to attend?</label>
              <textarea 
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us what excites you about TEDxGCEM..." 
                className={`w-full bg-black/40 border ${errors.motivation ? 'border-ted-red' : 'border-white/10'} rounded-3xl px-6 py-4 outline-none focus:border-ted-red focus:shadow-[0_0_15px_rgba(235,0,40,0.1)] transition-all text-white resize-none`}
              />
              {errors.motivation && <p className="text-ted-red text-[11px] ml-4 font-semibold">{errors.motivation}</p>}
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
          </form>
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
                  setFormData({ fullName: "", email: "", phone: "", organization: "", motivation: "" });
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
