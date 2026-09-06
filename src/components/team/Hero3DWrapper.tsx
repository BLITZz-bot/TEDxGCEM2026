'use client';

import React, { Component, ReactNode } from 'react';
import dynamicImport from 'next/dynamic';

const Hero3D = dynamicImport(() => import('@/components/team/Hero3D'), {
  ssr: false,
  loading: () => null,
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class Hero3DErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.warn('Hero3D WebGL fallback triggered:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#06070B]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-950/30 via-slate-950/80 to-[#06070B]" />
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Hero3DWrapper() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <Hero3DErrorBoundary>
        <Hero3D />
      </Hero3DErrorBoundary>
    </div>
  );
}
