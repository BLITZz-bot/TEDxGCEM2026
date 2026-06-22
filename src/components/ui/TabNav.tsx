"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export type TabId = 
  | "home" 
  | "about" 
  | "speakers" 
  | "schedule" 
  | "partners" 
  | "register" 
  | "get-pass" 
  | "contact"
  | "admin";

interface Tab {
  id: TabId;
  label: string;
}

const mobileMenuConfig = {
  overlayPaddingTop: 50,       
  overlayPaddingBottom: 24,    
  overlayPaddingLeftRight: 24,  
  itemsGap: 7,                 
  itemPaddingY: 9,             
  itemPaddingX: 10,            
  itemFontSize: 19,            
};

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, isAdmin, loginWithGoogle, logout } = useAuth();

  const tabs: Tab[] = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "speakers", label: "Speakers" },
    { id: "schedule", label: "Schedule" },
    { id: "partners", label: "Partners" },
    { id: "register", label: "Register Now" },
    { id: "get-pass", label: "Get My Pass" },
    { id: "contact", label: "Contact" },
    ...(isAdmin ? [{ id: "admin", label: "Admin Console" }] as Tab[] : []),
  ];

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = user?.email?.substring(0, 2).toUpperCase() || "US";

  return (
    <>
      {/* Top Left Logo */}
      <div 
        className={cn(
          "fixed top-6 left-6 z-50 flex items-center pointer-events-auto cursor-pointer transition-opacity duration-300 mobile-nav-logo",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={() => onTabChange("home")}
      >
        <img 
          src="/logo-white.png" 
          alt="TEDxGCEM Logo" 
          className="h-10 md:h-12 w-auto object-contain" 
        />
      </div>

      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center p-6 pointer-events-none">
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 bg-ted-dark-gray/80 p-1.5 rounded-3xl sm:rounded-full border border-white/10 max-w-full overflow-x-auto no-scrollbar pointer-events-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative px-4 py-2 text-xs md:text-sm font-medium transition-colors duration-200 rounded-full outline-none whitespace-nowrap cursor-pointer",
                activeTab === tab.id ? "text-white" : "text-white/50 hover:text-white/80"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-ted-red rounded-full"
                  transition={{ type: "spring", duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Auth Widget (Top Right Corner) */}
      <div className="fixed top-6 right-6 z-50 hidden md:flex items-center pointer-events-auto">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-ted-red/80 focus:border-ted-red focus:outline-none transition-all shadow-lg flex items-center justify-center bg-white/5 cursor-pointer"
              aria-label="Toggle profile menu"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={user.user_metadata?.full_name || "Profile"} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs font-mono font-bold text-white">{initials}</span>
              )}
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  {/* Backdrop click collector */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-64 bg-neutral-950/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3 text-left"
                  >
                    <div className="border-b border-white/5 pb-2">
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Active Account</p>
                      <p className="text-xs font-bold text-white truncate max-w-full mt-0.5" title={user.user_metadata?.full_name}>
                        {user.user_metadata?.full_name || "TEDx Attendee"}
                      </p>
                      <p className="text-[9px] font-mono text-white/50 truncate max-w-full mt-0.5">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full py-2 bg-ted-red/10 border border-ted-red/20 text-ted-red text-[10px] font-bold font-mono rounded-xl uppercase tracking-wider hover:bg-ted-red hover:text-white transition-all text-center cursor-pointer"
                    >
                      Logout Session
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white text-white text-xs font-bold font-mono rounded-full uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="currentColor"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="currentColor"/>
            </svg>
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Mobile Hamburger Button */}
      <div className="fixed top-6 right-6 z-50 flex md:hidden pointer-events-auto mobile-nav-hamburger transition-opacity duration-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-black/85 transition-all duration-300"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Red accent transition slide */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 170, mass: 0.8 }}
              className="fixed inset-0 z-39 bg-ted-red pointer-events-none md:hidden"
            />
            
            {/* Main glassmorphic slide panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 160, mass: 0.9, delay: 0.05 }}
              className="fixed inset-0 z-40 bg-black flex flex-col justify-between pointer-events-auto md:hidden overflow-y-auto"
              style={{
                paddingTop: `${mobileMenuConfig.overlayPaddingTop}px`,
                paddingBottom: `${mobileMenuConfig.overlayPaddingBottom}px`,
                paddingLeft: `${mobileMenuConfig.overlayPaddingLeftRight}px`,
                paddingRight: `${mobileMenuConfig.overlayPaddingLeftRight}px`,
              }}
            >
              {/* Premium Background Ambient Glow */}
              <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-ted-red/10 blur-[120px] pointer-events-none" />
              <div className="absolute bottom-1/4 left-0 w-64 h-64 rounded-full bg-white/5 blur-[100px] pointer-events-none" />

              {/* Menu Header / Logo */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center justify-between border-b border-white/5 pb-4"
              >
                <div className="text-lg tracking-[0.25em] font-black uppercase font-sans">
                  <span className="text-ted-red">TED<span className="lowercase">x</span></span>
                  <span className="text-white">GCEM</span>
                  <span className="text-white/40 tracking-[0.2em] font-sans ml-1 text-xs">2026</span>
                </div>
              </motion.div>

              {/* Navigation Items */}
              <div 
                className="flex flex-col my-auto py-2"
                style={{ gap: `${mobileMenuConfig.itemsGap}px` }}
              >
                {tabs.map((tab, idx) => {
                  const isActive = activeTab === tab.id;
                  const formattedNum = String(idx + 1).padStart(2, "0");
                  
                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ delay: idx * 0.04 + 0.2 }}
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "relative flex items-center justify-between rounded-xl w-full text-left transition-all duration-300 group overflow-hidden cursor-pointer",
                        isActive 
                          ? "bg-white/5 border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" 
                          : "border border-transparent hover:bg-white/[0.02]"
                      )}
                      style={{
                        paddingTop: `${mobileMenuConfig.itemPaddingY}px`,
                        paddingBottom: `${mobileMenuConfig.itemPaddingY}px`,
                        paddingLeft: `${mobileMenuConfig.itemPaddingX}px`,
                        paddingRight: `${mobileMenuConfig.itemPaddingX}px`,
                      }}
                    >
                      {/* Active Background Glow */}
                      {isActive && (
                        <motion.div 
                          layoutId="mobile-active-glow"
                          className="absolute inset-0 bg-gradient-to-r from-ted-red/10 via-transparent to-transparent pointer-events-none"
                        />
                      )}

                      <div className="flex items-center gap-6 z-10">
                        {/* Index Number */}
                        <span className={cn(
                          "text-xs font-mono font-bold tracking-wider transition-colors",
                          isActive ? "text-ted-red" : "text-white/20 group-hover:text-white/40"
                        )}>
                          {formattedNum}
                        </span>

                        {/* Label */}
                        <span 
                          className={cn(
                            "font-black uppercase tracking-[0.18em] transition-all duration-300",
                            isActive 
                              ? "text-white translate-x-1" 
                              : "text-white/50 group-hover:text-white group-hover:translate-x-1"
                          )}
                          style={{ fontSize: `${mobileMenuConfig.itemFontSize}px` }}
                        >
                          {tab.label}
                        </span>
                      </div>

                      {/* Right Indicator Icon */}
                      <div className="flex items-center z-10">
                        {isActive ? (
                          <motion.div
                            layoutId="mobile-active-line"
                            className="w-1.5 h-1.5 rounded-full bg-ted-red shadow-[0_0_8px_#EB0028]"
                          />
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/30 text-xs translate-x-2 group-hover:translate-x-0">
                            →
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Menu Footer */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="border-t border-white/5 pt-4 flex flex-col gap-4"
              >
                {/* Mobile Auth Indicator */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2">
                  {user ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase font-mono text-white/40">Signed in as:</span>
                        <span className="text-xs font-mono text-white font-bold truncate max-w-[180px]">{user.email}</span>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="px-3 py-1.5 bg-ted-red/10 border border-ted-red/30 rounded-xl text-[10px] text-ted-red font-bold font-mono uppercase tracking-wider cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        loginWithGoogle();
                        setIsOpen(false);
                      }}
                      className="w-full py-3 bg-white text-black font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      <span>Sign In with Google</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[8px] uppercase tracking-widest text-white/30 font-semibold max-w-[200px]">
                    This independent TEDx event is operated under license from TED.
                  </span>
                  
                  {/* Mini Social Icons */}
                  <div className="flex gap-4">
                    <a 
                      href="https://www.instagram.com/tedxgcem/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-ted-red hover:bg-ted-red/10 transition-all text-white/60 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/tedxgcem/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-ted-red hover:bg-ted-red/10 transition-all text-white/60 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
