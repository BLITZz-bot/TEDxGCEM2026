"use client";

import React, { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  siteKey?: string;
  className?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    turnstile?: any;
    onTurnstileLoaded?: () => void;
  }
}

export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  siteKey,
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const effectiveSiteKey = siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // Real Cloudflare keys always start with "0x4AAAAAA". Only treat as placeholder if missing or contains "..."
  const isPlaceholderKey =
    !effectiveSiteKey ||
    effectiveSiteKey.trim() === "" ||
    effectiveSiteKey.includes("...") ||
    effectiveSiteKey.toLowerCase().includes("placeholder") ||
    effectiveSiteKey.toLowerCase().includes("your_");

  const [isSimulatedVerified, setIsSimulatedVerified] = useState(false);

  useEffect(() => {
    // If no real production/test key is configured yet, safely auto-verify in dev mode
    if (isPlaceholderKey) {
      const timer = setTimeout(() => {
        setIsSimulatedVerified(true);
        onSuccess("mock_dev_verified_turnstile_token");
      }, 500);
      return () => clearTimeout(timer);
    }

    // Production Cloudflare Turnstile loader
    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return; // already rendered

      const executeRender = () => {
        if (!isMounted || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
        try {
          // Clear any leftover DOM inside container before rendering
          if (containerRef.current) {
            containerRef.current.innerHTML = "";
          }
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: effectiveSiteKey,
            theme: "dark",
            size: "normal",
            callback: (token: string) => {
              if (isMounted) onSuccess(token);
            },
            "error-callback": (err: string) => {
              console.warn("[Turnstile] Widget error:", err);
              if (isMounted && onError) onError(err);
            },
            "expired-callback": () => {
              if (isMounted && onExpire) onExpire();
            },
          });
        } catch (err) {
          console.error("[Turnstile] Render error:", err);
        }
      };

      executeRender();
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.querySelector(
        'script[src*="challenges.cloudflare.com/turnstile"]'
      );
      if (!existingScript) {
        const script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          renderWidget();
        };
        document.head.appendChild(script);
      } else {
        const checkInterval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkInterval);
            renderWidget();
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [effectiveSiteKey, isPlaceholderKey, onSuccess, onError, onExpire]);

  if (isPlaceholderKey) {
    return (
      <div
        className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-mono select-none ${className}`}
      >
        <ShieldCheck
          className={`w-4 h-4 ${isSimulatedVerified ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}
        />
        <span>
          {isSimulatedVerified
            ? "Cloudflare Turnstile Verified (Simulated Dev Mode)"
            : "Verifying security posture..."}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex justify-center my-2 min-h-[65px] ${className}`}>
      <div ref={containerRef} />
    </div>
  );
}
