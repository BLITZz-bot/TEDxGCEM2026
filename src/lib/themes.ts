export type TeamGroup =
  | 'leadership'
  | 'technology'
  | 'creative'
  | 'curation'
  | 'partnerships'
  | 'media';

export interface TeamTheme {
  name: string;
  accentColor: string;
  accentGlow: string;
  bgColor: string;
  textColor: string;
  cardBg: string;
  borderColor: string;
  fontFamilyClass: string;
  badgeStyle: string;
  motionCharacter: string;
  easing: number[];
}

export const TEDX_RED = '#EB0028';

export const teamThemes: Record<TeamGroup, TeamTheme> = {
  leadership: {
    name: 'Leadership',
    accentColor: '#EB0028',
    accentGlow: 'rgba(235, 0, 40, 0.45)',
    bgColor: '#0A0506',
    textColor: '#FFFFFF',
    cardBg: 'rgba(235, 0, 40, 0.06)',
    borderColor: 'rgba(235, 0, 40, 0.35)',
    fontFamilyClass: 'font-sans font-black tracking-tight',
    badgeStyle: 'border-[#EB0028] text-red-400 bg-red-950/60 font-bold uppercase tracking-widest',
    motionCharacter: 'Bold, high-contrast red/black, confident structured entrances',
    easing: [0.16, 1, 0.3, 1],
  },
  technology: {
    name: 'Technology',
    accentColor: '#00F0FF',
    accentGlow: 'rgba(0, 240, 255, 0.35)',
    bgColor: '#080C14',
    textColor: '#F1F5F9',
    cardBg: 'rgba(0, 240, 255, 0.06)',
    borderColor: 'rgba(0, 240, 255, 0.25)',
    fontFamilyClass: 'font-mono',
    badgeStyle: 'border-cyan-400 text-cyan-400 bg-cyan-950/40 font-mono',
    motionCharacter: 'Dark technical aesthetic, cyan/electric accents, subtle glitch-in typography',
    easing: [0.25, 1, 0.5, 1],
  },
  creative: {
    name: 'Creative',
    accentColor: '#FF2A5F',
    accentGlow: 'rgba(255, 42, 95, 0.45)',
    bgColor: '#0F0913',
    textColor: '#FAFAFA',
    cardBg: 'rgba(255, 42, 95, 0.06)',
    borderColor: 'rgba(255, 42, 95, 0.3)',
    fontFamilyClass: 'font-sans tracking-wide',
    badgeStyle: 'border-rose-500 text-rose-400 bg-rose-950/40 font-bold uppercase',
    motionCharacter: 'Artistic visual language, expressive shapes, color-block composition and shape-morphing motion',
    easing: [0.68, -0.55, 0.265, 1.55],
  },
  curation: {
    name: 'Curation',
    accentColor: '#A855F7',
    accentGlow: 'rgba(168, 85, 247, 0.35)',
    bgColor: '#0E0918',
    textColor: '#FAF5FF',
    cardBg: 'rgba(168, 85, 247, 0.06)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    fontFamilyClass: 'font-sans light',
    badgeStyle: 'border-purple-400 text-purple-300 bg-purple-950/40',
    motionCharacter: 'Minimal, intellectual, spacious layout, restrained motion and slow fades',
    easing: [0.4, 0, 0.2, 1],
  },
  partnerships: {
    name: 'Partnerships',
    accentColor: '#E5C158',
    accentGlow: 'rgba(229, 193, 88, 0.35)',
    bgColor: '#12100A',
    textColor: '#FDFBF7',
    cardBg: 'rgba(229, 193, 88, 0.06)',
    borderColor: 'rgba(229, 193, 88, 0.3)',
    fontFamilyClass: 'font-sans uppercase tracking-widest',
    badgeStyle: 'border-amber-400 text-amber-300 bg-amber-950/40 font-semibold',
    motionCharacter: 'Elegant corporate presentation, muted gold accent line, refined transitions',
    easing: [0.33, 1, 0.68, 1],
  },
  media: {
    name: 'Media',
    accentColor: '#FF6B00',
    accentGlow: 'rgba(255, 107, 0, 0.4)',
    bgColor: '#120A04',
    textColor: '#FFF7ED',
    cardBg: 'rgba(255, 107, 0, 0.06)',
    borderColor: 'rgba(255, 107, 0, 0.3)',
    fontFamilyClass: 'font-sans font-bold',
    badgeStyle: 'border-orange-500 text-orange-400 bg-orange-950/40',
    motionCharacter: 'Energetic editorial style, warm gradient treatment and faster entrances',
    easing: [0.16, 1, 0.3, 1],
  },
};

export function getTeamTheme(team: string): TeamTheme {
  const normalized = team.toLowerCase() as TeamGroup;
  return teamThemes[normalized] || teamThemes.technology;
}
