"use client";

// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.

/**
 * @component ParticleBackground
 *
 * Fixed-viewport interactive particle constellation network simulation with
 * ambient glowing lights, connective laser lines, and high-performance cursor flee physics.
 *
 * Fixed to the viewport so the full density of floating nodes is always visible on screen
 * while scrolling through any section.
 */

import React, { useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const particleCount = isMobile ? 40 : 90;
    const connectionDistance = 120;
    const mouseRadius = 150;

    const mouse = { x: -1000, y: -1000 };

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    handleResize();

    // Spawn particles distributed across the viewport
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        radius: Math.random() * 2.2 + 0.9,
        // 75% TED-Red nodes, 25% White nodes
        color: Math.random() > 0.25 ? "235, 0, 40" : "255, 255, 255",
      });
    }

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update particle coordinates
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap or bounce off viewport borders
        if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
        if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;

        // Flee interaction from cursor (squared distance optimization)
        if (mouse.x !== -1000 && mouse.y !== -1000) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const mouseRadiusSq = mouseRadius * mouseRadius;
          if (distSq < mouseRadiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (mouseRadius - dist) / mouseRadius;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force * 1.8;
            p.y += Math.sin(angle) * force * 1.8;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, 0.8)`;
        ctx.fill();
      });

      // 1. Draw connective laser lines from the cursor to all nearby particles
      if (mouse.x !== -1000 && mouse.y !== -1000) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(235, 0, 40, 0.35)";
        ctx.lineWidth = 0.85;
        const mouseRadiusSq = mouseRadius * mouseRadius;
        particles.forEach((p) => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < mouseRadiusSq) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
          }
        });
        ctx.stroke();
      }

      // 2. Draw connective lines between neighboring particles
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 0.5;
      const connDistSq = connectionDistance * connectionDistance;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connDistSq) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Fullscreen Viewport Particle Constellation Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none opacity-65"
      />

      {/* Radial ambient fade overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80 pointer-events-none" />

      {/* Background ambient glowing light spots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-10 w-[450px] h-[450px] bg-ted-red/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-10 w-[450px] h-[450px] bg-ted-red/8 rounded-full blur-[130px]" />
      </div>
    </div>
  );
}
