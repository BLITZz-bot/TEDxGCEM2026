'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { getTeamTheme, TeamTheme } from '@/lib/themes';

const ThemeContext = createContext<{ theme: TeamTheme }>({
  theme: getTeamTheme('technology'),
});

export function ThemeProvider({
  team,
  children,
}: {
  team: string;
  children: React.ReactNode;
}) {
  const theme = getTeamTheme(team);

  useEffect(() => {
    // Inject per-team CSS variables into root element
    const root = document.documentElement;
    root.style.setProperty('--team-accent', theme.accentColor);
    root.style.setProperty('--team-glow', theme.accentGlow);
    root.style.setProperty('--team-bg', theme.bgColor);
    root.style.setProperty('--team-text', theme.textColor);
    root.style.setProperty('--team-card-bg', theme.cardBg);
    root.style.setProperty('--team-border', theme.borderColor);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div
        className="min-h-screen transition-colors duration-500 ease-in-out"
        style={{
          backgroundColor: theme.bgColor,
          color: theme.textColor,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTeamTheme = () => useContext(ThemeContext);
