export type ThemePaletteId = 'palette-1' | 'palette-2' | 'palette-3' | 'palette-4';

export interface ThemeColorPalette {
  id: ThemePaletteId;
  name: string;
  tagline: string;
  description: string;
  colors: [string, string, string, string, string];
  cssVars: Record<string, string>;
}

export const THEME_PALETTES: Record<ThemePaletteId, ThemeColorPalette> = {
  'palette-1': {
    id: 'palette-1',
    name: 'Forest Emerald & Warm Amber',
    tagline: 'Deep Forest Pine with Earthy Amber & Mint Canvas',
    description: '1st Design: #2C3531, #116466, #D9B08C, #FFCB9A, #D1E8E2',
    colors: ['#2C3531', '#116466', '#D9B08C', '#FFCB9A', '#D1E8E2'],
    cssVars: {
      '--app-bg': '#D1E8E2',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#E4F1EE',
      '--app-border': '#B7DBD2',
      '--app-primary': '#116466',
      '--app-primary-hover': '#0D4E50',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#2C3531',
      '--app-accent': '#D9B08C',
      '--app-highlight': '#FFCB9A',
      '--app-text-title': '#2C3531',
      '--app-text-body': '#2C3531',
      '--app-text-muted': '#566661',
      '--app-badge-bg': '#FFCB9A',
      '--app-badge-text': '#2C3531',
      '--app-card-border': '#B7DBD2',
      '--app-nav-active': '#116466',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#116466',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#D9B08C',
      '--app-accent-btn-text': '#2C3531'
    }
  },
  'palette-2': {
    id: 'palette-2',
    name: 'Deep Marine & Terracotta Rust',
    tagline: 'Oceanic Abyss, Vivid Cyan & Warm Terracotta',
    description: '2nd Design: #003135, #024950, #964734, #0FA4AF, #AFDDE5',
    colors: ['#003135', '#024950', '#964734', '#0FA4AF', '#AFDDE5'],
    cssVars: {
      '--app-bg': '#E6F5F8',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#DDF1F5',
      '--app-border': '#92CCD6',
      '--app-primary': '#024950',
      '--app-primary-hover': '#003135',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#0FA4AF',
      '--app-accent': '#964734',
      '--app-highlight': '#AFDDE5',
      '--app-text-title': '#003135',
      '--app-text-body': '#003135',
      '--app-text-muted': '#3A676E',
      '--app-badge-bg': '#964734',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#92CCD6',
      '--app-nav-active': '#024950',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#024950',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#964734',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'palette-3': {
    id: 'palette-3',
    name: 'Midnight Navy & Industrial Slate',
    tagline: 'Pure White, Deep Charcoal, Steel Slate & Midnight Petrol',
    description: '3rd Design: #FFFFFF, #242424, #5C7C89, #1F4959, #011425',
    colors: ['#FFFFFF', '#242424', '#5C7C89', '#1F4959', '#011425'],
    cssVars: {
      '--app-bg': '#F4F7F9',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#E4ECF0',
      '--app-border': '#BAC8D0',
      '--app-primary': '#1F4959',
      '--app-primary-hover': '#011425',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#5C7C89',
      '--app-accent': '#5C7C89',
      '--app-highlight': '#242424',
      '--app-text-title': '#011425',
      '--app-text-body': '#242424',
      '--app-text-muted': '#5C7C89',
      '--app-badge-bg': '#1F4959',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#BAC8D0',
      '--app-nav-active': '#1F4959',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#1F4959',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#5C7C89',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'palette-4': {
    id: 'palette-4',
    name: 'Nordic Frost Sky & Deep Indigo',
    tagline: 'Crisp White, Ice Mist, Sky Azure & Nordic Indigo',
    description: '4th Design: #FFFFFF, #EDF3FB, #CBE3EF, #5AA8D6, #3A4163',
    colors: ['#FFFFFF', '#EDF3FB', '#CBE3EF', '#5AA8D6', '#3A4163'],
    cssVars: {
      '--app-bg': '#EDF3FB',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#E0EDF8',
      '--app-border': '#CBE3EF',
      '--app-primary': '#3A4163',
      '--app-primary-hover': '#262C47',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#5AA8D6',
      '--app-accent': '#5AA8D6',
      '--app-highlight': '#CBE3EF',
      '--app-text-title': '#3A4163',
      '--app-text-body': '#3A4163',
      '--app-text-muted': '#6B7499',
      '--app-badge-bg': '#5AA8D6',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#CBE3EF',
      '--app-nav-active': '#3A4163',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#3A4163',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#5AA8D6',
      '--app-accent-btn-text': '#FFFFFF'
    }
  }
};

export const DEFAULT_PALETTE_ID: ThemePaletteId = 'palette-1';

export function getSavedPalette(): ThemePaletteId {
  try {
    const saved = localStorage.getItem('cssential_palette') as ThemePaletteId;
    if (saved && THEME_PALETTES[saved]) {
      return saved;
    }
  } catch {
    // Ignore storage issues
  }
  return DEFAULT_PALETTE_ID;
}

export function applyThemePalette(paletteId: ThemePaletteId): void {
  const palette = THEME_PALETTES[paletteId] || THEME_PALETTES[DEFAULT_PALETTE_ID];
  const root = document.documentElement;

  // Set attribute for data selector
  root.setAttribute('data-theme', palette.id);

  // Apply all custom properties to root
  Object.entries(palette.cssVars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });

  try {
    localStorage.setItem('cssential_palette', paletteId);
  } catch {
    // Ignore
  }
}
