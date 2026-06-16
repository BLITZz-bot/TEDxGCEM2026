"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Contact() {
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [mapView, setMapView] = useState<"roadmap" | "satellite">("roadmap");

  const mapUrl = mapView === "roadmap"
    ? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.7735829891867!2d77.71457027490598!3d12.986328487330406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11920e734dc9%3A0xefdf9d49329b63e8!2sGopalan%20College%20of%20Engineering%20and%20Management!5e0!3m2!1sen!2sin!4v1780655596097!5m2!1sen!2sin"
    : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.7735829891867!2d77.71457027490598!3d12.986328487330406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11920e734dc9%3A0xefdf9d49329b63e8!2sGopalan%20College%20of%20Engineering%20and%20Management!5e1!3m2!1sen!2sin!4v1780655596097!5m2!1sen!2sin";
  const googleMapsLink = "https://www.google.com/maps/search/Gopalan+College+of+Engineering+and+Management"; 

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col">
      {/* Hero Banner Manifesto */}
      <div className="mb-24 flex flex-col justify-between items-start gap-6 border-b border-white/10 pb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.95] uppercase"
        >
          GET IN TOUCH <br />
          WITH OUR <span className="text-ted-red">TEAM</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-xl"
        >
          Have a question, feedback, or want to partner with us? Reach out and let&apos;s build something extraordinary together.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
        {/* Left Side: Location & Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-ted-dark-gray/50 border border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col h-full overflow-hidden"
        >
          <div className="mb-8">
            <h4 className="text-ted-red font-bold uppercase tracking-widest text-xs mb-4">Location</h4>
            <p className="text-2xl font-black mb-2">GOPALAN COLLEGE OF ENGINEERING AND MANAGEMENT</p>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
             
              Bengaluru, Karnataka 560048
            </p>

            <div className="space-y-6">
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=tedxgcem@gmail.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 group cursor-pointer w-fit"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:border-ted-red/50 group-hover:text-ted-red group-hover:bg-ted-red/10 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <h4 className="text-ted-red font-bold uppercase tracking-widest text-[10px] mb-0.5">Email Us</h4>
                  <span className="text-xl font-black group-hover:text-ted-red transition-colors block leading-tight">tedxgcem@gmail.com</span>
                </div>
              </a>

              <a href="https://www.instagram.com/tedxgcem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group cursor-pointer w-fit">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:border-ted-red/50 group-hover:text-ted-red group-hover:bg-ted-red/10 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </div>
                <div>
                  <h4 className="text-ted-red font-bold uppercase tracking-widest text-[10px] mb-0.5">Instagram</h4>
                  <span className="text-xl font-black group-hover:text-ted-red transition-colors block leading-tight">TEDxGCEM</span>
                </div>
              </a>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-grow relative rounded-[2rem] overflow-hidden border border-white/5 min-h-[300px] group">
            <iframe
              src={mapUrl}
              className="w-full h-full border-0 grayscale-0 md:grayscale opacity-100 md:opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            {/* 3D Satellite Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setMapView(prev => prev === "roadmap" ? "satellite" : "roadmap");
              }}
              className="absolute bottom-4 left-4 z-20 w-14 h-14 rounded-2xl border border-white/25 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center shadow-lg hover:border-ted-red/50 hover:bg-black transition-all duration-300 cursor-pointer group/toggle"
              title={mapView === "roadmap" ? "Switch to 3D Satellite View" : "Switch to 2D Map View"}
            >
              <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
                {mapView === "roadmap" ? (
                  <svg className="w-5 h-5 text-white/70 group-hover/toggle:text-ted-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white/70 group-hover/toggle:text-ted-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                )}
                <span className="text-[7px] font-black tracking-widest uppercase mt-1 text-white/50 group-hover/toggle:text-white transition-colors">
                  {mapView === "roadmap" ? "3D Earth" : "2D Map"}
                </span>
              </div>
            </button>
            {/* Overlay to make it clickable */}
            <a 
              href={googleMapsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute inset-0 z-10 cursor-pointer"
              title="Open in Google Maps"
            />
          </div>
        </motion.div>

        {/* Right Side: Contact Form Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-ted-dark-gray/50 border border-white/10 p-8 md:p-10 rounded-[2.5rem] flex flex-col h-full min-h-[400px] justify-center"
        >
          <AnimatePresence mode="wait">
            {!showContactForm ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center text-center space-y-6 py-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white">Send a Message</h4>
                  <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
                    Have a question, speaker suggestion, or interested in partnering with us? Click below to drop our team a message.
                  </p>
                </div>

                <button
                  onClick={() => setShowContactForm(true)}
                  className="group relative px-8 py-4 bg-ted-red text-white font-black rounded-2xl text-xs shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.5)] hover:bg-white hover:text-ted-red transition-all duration-300 uppercase tracking-widest flex items-center gap-3 cursor-pointer"
                >
                  <span>Open Contact Form</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </motion.div>
            ) : !isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col h-full justify-between"
              >
                {/* Form header / Back button */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="group flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-all cursor-pointer font-bold font-mono"
                  >
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back</span>
                  </button>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-ted-red font-black">Direct Message</span>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all text-sm text-white"
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all text-sm text-white"
                    />
                    <textarea 
                      rows={5}
                      placeholder="Your Message" 
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-4 outline-none focus:border-ted-red transition-all resize-none text-sm text-white"
                    />
                  </div>
                  
                  <button type="submit" className="w-full py-5 mt-6 bg-ted-red text-white font-black rounded-2xl shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.5)] hover:bg-white hover:text-ted-red transition-all duration-300 uppercase tracking-widest text-sm cursor-pointer">
                    Send Message
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center text-center space-y-6 py-8"
              >
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white">Message Transmitted</h4>
                  <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                    Thank you for reaching out. Our organizing committee has received your message and will respond within 24 to 48 hours.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setShowContactForm(false);
                  }}
                  className="px-8 py-4 bg-ted-red text-white font-black rounded-2xl text-xs shadow-[0_0_20px_rgba(235,0,40,0.3)] hover:shadow-[0_0_30px_rgba(235,0,40,0.5)] hover:bg-white hover:text-ted-red transition-all duration-300 uppercase tracking-widest cursor-pointer"
                >
                  Go Back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
