"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { TabId } from "@/components/ui/TabNav";

interface HeroProps {
  onTabChange: (id: TabId) => void;
}

export default function Hero({ onTabChange }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 3D Parallax Tilt Effects
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [15, -15]);
  const rotateY = useTransform(x, [-300, 300], [-15, 15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left - width / 2;
        const mouseY = e.clientY - rect.top - height / 2;
        x.set(mouseX);
        y.set(mouseY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  // Spark Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let sparks: Spark[] = [];
    const sparkCount = 100;

    const resize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    class Spark {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      size = 0;
      alpha = 0;
      decay = 0;

      constructor() {
        this.reset();
        this.y = Math.random() * canvas!.height;
      }

      reset() {
        this.x = Math.random() * canvas!.width;
        this.y = canvas!.height + Math.random() * 20;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -(Math.random() * 2.5 + 0.5);
        this.size = Math.random() * 2.5 + 0.5;
        this.alpha = Math.random() * 0.7 + 0.3;
        this.decay = Math.random() * 0.005 + 0.002;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        if (this.alpha <= 0 || this.y < -10) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 0, 40, ${this.alpha})`;
        ctx.shadowBlur = this.size * 4;
        ctx.shadowColor = "#EB0028";
        ctx.fill();
      }
    }

    for (let i = 0; i < sparkCount; i++) {
      sparks.push(new Spark());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparks.forEach(s => {
        s.update();
        s.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="min-h-screen relative flex flex-col justify-center items-center px-6 overflow-hidden bg-black text-center"
    >
      {/* Spotlight overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-25 hidden md:block"
        style={{
          background: `radial-gradient(800px at ${mousePos.x}px ${mousePos.y}px, rgba(235, 0, 40, 0.18), transparent 80%)`
        }}
      />

      {/* Grid Pattern Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
              <path d="M 45 0 L 0 0 0 45" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Canvas Sparks */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Futuristic Geometric Backdrop Rings */}
      <div className="absolute z-0 pointer-events-none opacity-20 w-[400px] h-[400px] md:w-[600px] md:h-[600px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
      <div className="absolute z-0 pointer-events-none opacity-10 w-[300px] h-[300px] md:w-[500px] md:h-[500px] border border-dashed border-ted-red/20 rounded-full animate-[spin_30s_linear_infinite_reverse]" />

      {/* 3D Tilt Wrapper */}
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 flex flex-col items-center max-w-4xl"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
          style={{ transform: "translateZ(50px)" }}
          className="flex items-center gap-3 mb-6"
        >
          <img
            src="/logo-white.png"
            alt="TEDxGCEM"
            className="h-10 md:h-12 w-auto"
            style={{ mixBlendMode: "screen", filter: "brightness(1.15)" }}
          />
          <span className="text-ted-red text-sm font-black uppercase tracking-[0.3em] font-mono px-3 py-1 bg-ted-red/10 border border-ted-red/20 rounded-full">2026</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{ transform: "translateZ(80px)" }}
          className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none select-none text-transparent bg-clip-text bg-[linear-gradient(110deg,#ffffff_25%,#EB0028_48%,#EB0028_52%,#ffffff_75%)] bg-[length:250%_100%] animate-shimmer"
        >
          RIPPLE
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ transform: "translateZ(40px)" }}
          className="text-white/60 text-lg md:text-xl font-medium max-w-xl mt-6 leading-relaxed"
        >
          One catalyst idea, echoing outwards, challenging the status quo, forming connections, and building community momentum.
        </motion.p>

        {/* Dynamic Interactive Call-to-actions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{ transform: "translateZ(30px)" }}
          className="flex flex-col sm:flex-row gap-4 mt-10 justify-center w-full max-w-md"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(235,0,40,0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange("register")}
            className="px-10 py-5 bg-ted-red text-white font-black rounded-2xl text-base transition-all uppercase tracking-widest cursor-pointer shadow-[0_0_20px_rgba(235,0,40,0.3)] text-center flex-1"
          >
            Get Tickets
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.06)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange("about")}
            className="px-10 py-5 bg-transparent border border-white/10 text-white font-bold rounded-2xl text-base transition-all uppercase tracking-widest cursor-pointer text-center flex-1"
          >
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
