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

  const isLocalEnv =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168.") ||
      process.env.NODE_ENV !== "production");

  const effectiveSiteKey = siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // Real Cloudflare keys always start with "0x4AAAAAA". Only treat as placeholder if missing or contains "..."
  const isPlaceholderKey =
    !effectiveSiteKey ||
    effectiveSiteKey.trim() === "" ||
    effectiveSiteKey.includes("...") ||
    effectiveSiteKey.toLowerCase().includes("placeholder") ||
    effectiveSiteKey.toLowerCase().includes("your_");

  // On localhost / dev environments, use Cloudflare's official always-pass testing key
  // Production domain uses the real site key from .env.local
  const activeSiteKey = isLocalEnv
    ? "1x00000000000000000000AA"
    : (effectiveSiteKey || "1x00000000000000000000AA");

  const [isSimulatedVerified, setIsSimulatedVerified] = useState(false);
  const [hasDevFallback, setHasDevFallback] = useState(false);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  });

  const triggerDevVerification = () => {
    setIsSimulatedVerified(true);
    onSuccessRef.current("mock_dev_verified_turnstile_token");
  };

  useEffect(() => {
    let isMounted = true;
    let fallbackTimeout: NodeJS.Timeout | null = null;

    // In local dev, auto-verify after 2s if Cloudflare takes too long or fails
    if (isLocalEnv) {
      fallbackTimeout = setTimeout(() => {
        if (isMounted) {
          console.log("[Turnstile] Local dev auto-verification active.");
          triggerDevVerification();
        }
      }, 1800);
    }

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return; // already rendered

      const executeRender = () => {
        if (!isMounted || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
        try {
          if (containerRef.current) {
            containerRef.current.innerHTML = "";
          }
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: activeSiteKey,
            theme: "dark",
            size: "normal",
            callback: (token: string) => {
              console.log("[Turnstile] Verified successfully! Security token generated.");
              if (fallbackTimeout) clearTimeout(fallbackTimeout);
              if (isMounted) onSuccessRef.current?.(token);
            },
            "error-callback": (err: string) => {
              console.warn("[Turnstile] Widget notice/domain challenge:", err);
              if (isMounted && isLocalEnv) {
                setHasDevFallback(true);
                triggerDevVerification();
              } else if (isMounted && onErrorRef.current) {
                onErrorRef.current(err);
              }
            },
            "expired-callback": () => {
              if (isMounted && onExpireRef.current) onExpireRef.current();
            },
          });
        } catch (err) {
          console.error("[Turnstile] Render error:", err);
          if (isMounted && isLocalEnv) {
            setHasDevFallback(true);
            triggerDevVerification();
          }
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
        script.onerror = () => {
          if (isMounted && isLocalEnv) {
            setHasDevFallback(true);
            triggerDevVerification();
          }
        };
        document.head.appendChild(script);
      } else {
        const checkInterval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkInterval);
            renderWidget();
          }
        }, 100);
        return () => {
          clearInterval(checkInterval);
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
        };
      }
    }

    return () => {
      isMounted = false;
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [activeSiteKey, isLocalEnv]);

  if (hasDevFallback || isPlaceholderKey) {
    return (
      <div
        onClick={triggerDevVerification}
        title={isLocalEnv ? "Click to verify (Development mode)" : undefined}
        className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-mono select-none cursor-pointer transition-colors hover:bg-white/10 ${className}`}
      >
        <ShieldCheck
          className={`w-4 h-4 ${isSimulatedVerified ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}
        />
        <span>
          {isSimulatedVerified
            ? "Cloudflare Turnstile Verified (Development Mode)"
            : "Click to verify security posture"}
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
