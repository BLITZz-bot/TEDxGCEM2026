"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Contact() {
  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.7735829891867!2d77.71457027490598!3d12.986328487330406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11920e734dc9%3A0xefdf9d49329b63e8!2sGopalan%20College%20of%20Engineering%20and%20Management!5e0!3m2!1sen!2sin!4v1780655596097!5m2!1sen!2sin";
  const googleMapsLink = "https://www.google.com/maps/search/Gopalan+College+of+Engineering+and+Management"; 

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <h2 className="text-ted-red font-bold text-xl uppercase tracking-widest mb-2">Get in Touch</h2>
        <h3 className="text-4xl md:text-6xl font-black italic uppercase">CONTACT US</h3>
      </motion.div>

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
            <p className="text-2xl font-black mb-2">GCEM Bengaluru</p>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
             
              Bengaluru, Karnataka 560048
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-ted-red font-bold uppercase tracking-widest text-xs mb-1">Email</h4>
                <a href="mailto:organizer@tedxgcem.com" className="text-xl font-black hover:text-ted-red transition-colors">organizer@tedxgcem.com</a>
              </div>
              <div>
                <h4 className="text-ted-red font-bold uppercase tracking-widest text-xs mb-1">Phone</h4>
                <a href="tel:+919900000000" className="text-xl font-black hover:text-ted-red transition-colors">+91 79758 71167</a>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-grow relative rounded-[2rem] overflow-hidden border border-white/5 min-h-[300px] group">
            <iframe
              src={mapUrl}
              className="w-full h-full border-0 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
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

        {/* Right Side: Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-ted-dark-gray/50 border border-white/10 p-8 md:p-10 rounded-[2.5rem] flex flex-col h-full"
        >
          <div className="mb-8">
            <h4 className="text-2xl font-black mb-4">Send a Message</h4>
            <p className="text-white/50 text-sm leading-relaxed">
              Have a specific question about the event, interested in partnering with us, 
              or want to suggest a potential speaker? Fill out the form below and our 
              organizing team will get back to you within 24-48 hours.
            </p>
          </div>

          <form className="space-y-4 flex-grow flex flex-col justify-between">
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all text-sm"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-ted-red transition-all text-sm"
              />
              <textarea 
                rows={6}
                placeholder="Your Message" 
                className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-4 outline-none focus:border-ted-red transition-all resize-none text-sm"
              />
            </div>
            
            <button className="w-full py-5 mt-6 bg-white text-black font-black rounded-2xl hover:bg-ted-red hover:text-white transition-all uppercase tracking-widest text-sm shadow-xl">
              Send Message
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
