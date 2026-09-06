'use client';

import React, { useRef, useEffect, useMemo, useSyncExternalStore } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function SculpturalEnvironment({ isVisible }: { isVisible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const secondaryMeshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const isMobile = viewport.width < 6;

  // Responsive scale and position offset
  const baseScale = isMobile ? 1.6 : 2.5;
  const targetX = isMobile ? 0.3 : 1.6;
  const targetY = isMobile ? -0.3 : -0.2;

  // Passive smooth scroll tracking
  const scrollProgressRef = useRef(0);
  const currentScrollRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || 0;
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          scrollProgressRef.current = Math.min(1, Math.max(0, scrollY / maxScroll));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state, delta) => {
    if (!isVisible) return;

    const time = state.clock.getElapsedTime();

    // Frame-rate independent smooth damping for scroll interpolation
    currentScrollRef.current = THREE.MathUtils.damp(
      currentScrollRef.current,
      scrollProgressRef.current,
      4,
      Math.min(delta, 0.1)
    );

    const p = currentScrollRef.current;

    // Continuous ultra-smooth ambient rotation
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(time * 0.12) * 0.15 + p * 1.2;
      meshRef.current.rotation.y = time * 0.08 + p * 1.8;
      meshRef.current.rotation.z = Math.cos(time * 0.08) * 0.1;
    }

    if (secondaryMeshRef.current) {
      secondaryMeshRef.current.rotation.x = -time * 0.1 - p * 1.0;
      secondaryMeshRef.current.rotation.y = time * 0.06 + p * 1.4;
    }

    // Smooth group position damping
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.damp(
        groupRef.current.position.y,
        targetY - p * 2.2,
        3,
        Math.min(delta, 0.1)
      );
      groupRef.current.position.x = THREE.MathUtils.damp(
        groupRef.current.position.x,
        targetX + p * 1.0,
        3,
        Math.min(delta, 0.1)
      );
    }
  });

  const sparkleSize = useMemo(() => isMobile ? 2.5 : 3.5, [isMobile]);

  return (
    <group ref={groupRef} position={[targetX, targetY, 0]}>
      <Float speed={1.0} rotationIntensity={0.5} floatIntensity={0.8}>
        {/* Primary Metallic Red Torus Knot - Geometry optimized (80, 20) */}
        <mesh ref={meshRef} scale={baseScale}>
          <torusKnotGeometry args={[1.2, 0.36, isMobile ? 48 : 80, isMobile ? 16 : 20, 2, 3]} />
          <MeshDistortMaterial
            color="#EB0028"
            roughness={0.2}
            metalness={0.8}
            distort={isMobile ? 0.1 : 0.18}
            speed={1.0}
            clearcoat={isMobile ? 0.4 : 0.6}
            clearcoatRoughness={0.3}
          />
        </mesh>

        {/* Secondary Metallic Accent Ring - Geometry optimized (16, 40) */}
        <mesh ref={secondaryMeshRef} scale={baseScale * 1.35} position={[-0.4, 0.2, -1.5]}>
          <torusGeometry args={[1.8, 0.07, 16, isMobile ? 30 : 40]} />
          <meshStandardMaterial
            color="#1E293B"
            roughness={0.3}
            metalness={0.9}
            wireframe
          />
        </mesh>
      </Float>

      {/* Floating Particles */}
      <Sparkles
        count={isMobile ? 15 : 35}
        scale={[12, 12, 12]}
        size={sparkleSize}
        speed={0.25}
        color="#EB0028"
        opacity={0.4}
      />
    </group>
  );
}

function subscribeReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function subscribeMobile(callback: () => void) {
  window.addEventListener('resize', callback, { passive: true });
  return () => window.removeEventListener('resize', callback);
}

function getMobileSnapshot() {
  return window.innerWidth < 768;
}

function getMobileServerSnapshot() {
  return false;
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}

function getVisibilitySnapshot() {
  return document.visibilityState === 'visible';
}

function getVisibilityServerSnapshot() {
  return true;
}

export default function Hero3D() {
  const isVisible = useSyncExternalStore(
    subscribeVisibility,
    getVisibilitySnapshot,
    getVisibilityServerSnapshot
  );
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot
  );
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Fallback view for reduced motion
  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#06070B]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950/80 to-[#06070B]" />
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={isMobile ? [1, 1] : [1, 1.25]}
      gl={{
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance',
        precision: isMobile ? 'mediump' : 'highp',
      }}
      frameloop={isVisible ? 'always' : 'never'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 8]} intensity={1.6} color="#FFFFFF" />
      <directionalLight position={[-10, -10, -5]} intensity={1.0} color="#EB0028" />
      <pointLight position={[0, 0, 5]} intensity={0.6} color="#FF2A5F" />

      <SculpturalEnvironment isVisible={isVisible} />
    </Canvas>
  );
}

