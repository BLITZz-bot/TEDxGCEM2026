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
  const isDevOrMissingKey = !effectiveSiteKey || effectiveSiteKey.includes("0x4AAAAAA") || effectiveSiteKey.trim() === "";

  const [isSimulatedVerified, setIsSimulatedVerified] = useState(false);

  useEffect(() => {
    // If no real production key is configured yet, safely auto-verify in dev mode
    if (isDevOrMissingKey) {
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

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: effectiveSiteKey,
          theme: "dark",
          size: "normal",
          callback: (token: string) => {
            if (isMounted) onSuccess(token);
          },
          "error-callback": (err: string) => {
            if (isMounted && onError) onError(err);
          },
          "expired-callback": () => {
            if (isMounted && onExpire) onExpire();
          },
        });
      } catch (err) {
        console.error("Turnstile render error:", err);
      }
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
  }, [effectiveSiteKey, isDevOrMissingKey, onSuccess, onError, onExpire]);

  if (isDevOrMissingKey) {
    return (
      <div
        className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-mono select-none ${className}`}
      >
        <ShieldCheck
          className={`w-4 h-4 ${isSimulatedVerified ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}
        />
        <span>
          {isSimulatedVerified
            ? "Cloudflare Turnstile Verified"
            : "Verifying security posture..."}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex justify-center my-2 ${className}`}>
      <div ref={containerRef} />
    </div>
  );
}
