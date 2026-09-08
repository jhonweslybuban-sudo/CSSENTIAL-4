export type ThemePaletteId =
  | 'palette-1'
  | 'palette-2'
  | 'palette-3'
  | 'palette-4'
  | 'solid-slate'
  | 'solid-parchment'
  | 'solid-mint'
  | 'solid-ice-blue'
  | 'solid-lavender'
  | 'solid-rose'
  | 'solid-dark-charcoal'
  | 'gradient-arctic-aurora'
  | 'gradient-sunset-glow'
  | 'gradient-oceanic-abyss'
  | 'gradient-emerald-dusk'
  | 'gradient-royal-twilight'
  | 'gradient-cyber-night'
  | 'gradient-emerald-matrix'
  | 'gradient-rose-gold'
  | 'custom';

export interface ThemeColorPalette {
  id: ThemePaletteId;
  name: string;
  tagline: string;
  description: string;
  category: 'academic' | 'solid' | 'gradient' | 'custom';
  colors: string[];
  bgPreview: string;
  cssVars: Record<string, string>;
}

export interface CustomThemeSettings {
  mode: 'solid' | 'gradient';
  solidColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  primaryColor: string;
  surfaceMode: 'light' | 'dark';
}

export const THEME_PALETTES: Record<ThemePaletteId, ThemeColorPalette> = {
  // ACADEMIC INSTITUTION PALETTES
  'palette-1': {
    id: 'palette-1',
    name: 'Forest Emerald & Warm Amber',
    tagline: 'Deep Forest Pine with Earthy Amber & Mint Canvas',
    description: '1st Design: #2C3531, #116466, #D9B08C, #FFCB9A, #D1E8E2',
    category: 'academic',
    colors: ['#2C3531', '#116466', '#D9B08C', '#FFCB9A', '#D1E8E2'],
    bgPreview: '#D1E8E2',
    cssVars: {
      '--app-bg': '#D1E8E2',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#E4F1EE',
      '--app-border': '#8ABCB0',
      '--app-primary': '#116466',
      '--app-primary-hover': '#0D4E50',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#2C3531',
      '--app-accent': '#D9B08C',
      '--app-highlight': '#FFCB9A',
      '--app-text-title': '#2C3531',
      '--app-text-body': '#2C3531',
      '--app-text-muted': '#4D5E57',
      '--app-badge-bg': '#FFCB9A',
      '--app-badge-text': '#2C3531',
      '--app-card-border': '#8ABCB0',
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
    category: 'academic',
    colors: ['#003135', '#024950', '#964734', '#0FA4AF', '#AFDDE5'],
    bgPreview: '#AFDDE5',
    cssVars: {
      '--app-bg': '#AFDDE5',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#D6EEF3',
      '--app-border': '#68B2BF',
      '--app-primary': '#024950',
      '--app-primary-hover': '#003135',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#0FA4AF',
      '--app-accent': '#964734',
      '--app-highlight': '#AFDDE5',
      '--app-text-title': '#003135',
      '--app-text-body': '#003135',
      '--app-text-muted': '#2E565D',
      '--app-badge-bg': '#964734',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#68B2BF',
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
    name: 'Subtle Sage & Deep Spruce Blue',
    tagline: 'Clean Off-White, Soft Sage Mint & Deep Teal Blue',
    description: '3rd Design: #F2F4F3, #A7D7C5, #74B49B, #5C7C89, #1F4959',
    category: 'academic',
    colors: ['#F2F4F3', '#A7D7C5', '#74B49B', '#5C7C89', '#1F4959'],
    bgPreview: '#F2F4F3',
    cssVars: {
      '--app-bg': '#F2F4F3',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#E2EBE7',
      '--app-border': '#A7D7C5',
      '--app-primary': '#1F4959',
      '--app-primary-hover': '#15323D',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#5C7C89',
      '--app-accent': '#74B49B',
      '--app-highlight': '#A7D7C5',
      '--app-text-title': '#1F4959',
      '--app-text-body': '#28363D',
      '--app-text-muted': '#5C7C89',
      '--app-badge-bg': '#74B49B',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#A7D7C5',
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
    category: 'academic',
    colors: ['#FFFFFF', '#EDF3FB', '#CBE3EF', '#5AA8D6', '#3A4163'],
    bgPreview: '#EDF3FB',
    cssVars: {
      '--app-bg': '#EDF3FB',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#DFEDF8',
      '--app-border': '#A5CCE3',
      '--app-primary': '#3A4163',
      '--app-primary-hover': '#262C47',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#5AA8D6',
      '--app-accent': '#5AA8D6',
      '--app-highlight': '#CBE3EF',
      '--app-text-title': '#3A4163',
      '--app-text-body': '#3A4163',
      '--app-text-muted': '#5B658A',
      '--app-badge-bg': '#5AA8D6',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#A5CCE3',
      '--app-nav-active': '#3A4163',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#3A4163',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#5AA8D6',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },

  // SOLID COLOR VARIATIONS
  'solid-slate': {
    id: 'solid-slate',
    name: 'Clean Slate Minimalist',
    tagline: 'Crisp, low-fatigue slate gray laboratory background',
    description: 'Solid Slate: #F1F5F9 clean neutral backdrop',
    category: 'solid',
    colors: ['#1E293B', '#3B82F6', '#0EA5E9', '#E2E8F0', '#F1F5F9'],
    bgPreview: '#F1F5F9',
    cssVars: {
      '--app-bg': '#F1F5F9',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#E2E8F0',
      '--app-border': '#CBD5E1',
      '--app-primary': '#1E293B',
      '--app-primary-hover': '#0F172A',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#475569',
      '--app-accent': '#3B82F6',
      '--app-highlight': '#E2E8F0',
      '--app-text-title': '#0F172A',
      '--app-text-body': '#334155',
      '--app-text-muted': '#64748B',
      '--app-badge-bg': '#3B82F6',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#CBD5E1',
      '--app-nav-active': '#1E293B',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#1E293B',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#3B82F6',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'solid-parchment': {
    id: 'solid-parchment',
    name: 'Warm Amber Parchment',
    tagline: 'Comfortable warm ivory canvas for long study sessions',
    description: 'Warm Parchment: #FDFBF7 warm background',
    category: 'solid',
    colors: ['#3F2E1E', '#92400E', '#D97706', '#FDE68A', '#FDFBF7'],
    bgPreview: '#FDFBF7',
    cssVars: {
      '--app-bg': '#FDFBF7',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#F8F3EA',
      '--app-border': '#E6DAC8',
      '--app-primary': '#78350F',
      '--app-primary-hover': '#582407',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#92400E',
      '--app-accent': '#D97706',
      '--app-highlight': '#FEF3C7',
      '--app-text-title': '#451A03',
      '--app-text-body': '#451A03',
      '--app-text-muted': '#78350F',
      '--app-badge-bg': '#D97706',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#E6DAC8',
      '--app-nav-active': '#78350F',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#78350F',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#D97706',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'solid-mint': {
    id: 'solid-mint',
    name: 'Fresh Mint Laboratory',
    tagline: 'Refreshing pale mint backdrop with deep emerald headers',
    description: 'Solid Mint: #E6F4F1 soothing green background',
    category: 'solid',
    colors: ['#064E3B', '#059669', '#10B981', '#A7F3D0', '#E6F4F1'],
    bgPreview: '#E6F4F1',
    cssVars: {
      '--app-bg': '#E6F4F1',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#D1EAE4',
      '--app-border': '#A7D9CF',
      '--app-primary': '#064E3B',
      '--app-primary-hover': '#022C22',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#047857',
      '--app-accent': '#10B981',
      '--app-highlight': '#D1FAE5',
      '--app-text-title': '#064E3B',
      '--app-text-body': '#064E3B',
      '--app-text-muted': '#047857',
      '--app-badge-bg': '#10B981',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#A7D9CF',
      '--app-nav-active': '#064E3B',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#064E3B',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#10B981',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'solid-ice-blue': {
    id: 'solid-ice-blue',
    name: 'Ice Blue Technician',
    tagline: 'High-contrast tech workstation atmosphere',
    description: 'Ice Blue: #E0F2FE clear cyber blue',
    category: 'solid',
    colors: ['#0C4A6E', '#0284C7', '#38BDF8', '#BAE6FD', '#E0F2FE'],
    bgPreview: '#E0F2FE',
    cssVars: {
      '--app-bg': '#E0F2FE',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#CFE8FC',
      '--app-border': '#93C5FD',
      '--app-primary': '#0369A1',
      '--app-primary-hover': '#075985',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#0284C7',
      '--app-accent': '#0284C7',
      '--app-highlight': '#BAE6FD',
      '--app-text-title': '#082F49',
      '--app-text-body': '#0C4A6E',
      '--app-text-muted': '#0369A1',
      '--app-badge-bg': '#0284C7',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#93C5FD',
      '--app-nav-active': '#0369A1',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#0369A1',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#0284C7',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'solid-lavender': {
    id: 'solid-lavender',
    name: 'Soft Lavender Violet',
    tagline: 'Gentle floral purple tint with high contrast text',
    description: 'Lavender: #F3E8FF soft violet backdrop',
    category: 'solid',
    colors: ['#581C87', '#7E22CE', '#A855F7', '#E9D5FF', '#F3E8FF'],
    bgPreview: '#F3E8FF',
    cssVars: {
      '--app-bg': '#F3E8FF',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#E9D5FF',
      '--app-border': '#D8B4FE',
      '--app-primary': '#581C87',
      '--app-primary-hover': '#3B0764',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#7E22CE',
      '--app-accent': '#9333EA',
      '--app-highlight': '#F3E8FF',
      '--app-text-title': '#3B0764',
      '--app-text-body': '#3B0764',
      '--app-text-muted': '#6B21A8',
      '--app-badge-bg': '#9333EA',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#D8B4FE',
      '--app-nav-active': '#581C87',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#581C87',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#9333EA',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'solid-rose': {
    id: 'solid-rose',
    name: 'Rose Quartz Blossom',
    tagline: 'Soft blush rose with deep crimson typography',
    description: 'Rose Quartz: #FFF1F2 subtle rose background',
    category: 'solid',
    colors: ['#881337', '#BE123C', '#F43F5E', '#FECDD3', '#FFF1F2'],
    bgPreview: '#FFF1F2',
    cssVars: {
      '--app-bg': '#FFF1F2',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#FFE4E6',
      '--app-border': '#FDA4AF',
      '--app-primary': '#9F1239',
      '--app-primary-hover': '#881337',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#BE123C',
      '--app-accent': '#E11D48',
      '--app-highlight': '#FFE4E6',
      '--app-text-title': '#4C0519',
      '--app-text-body': '#4C0519',
      '--app-text-muted': '#9F1239',
      '--app-badge-bg': '#E11D48',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#FDA4AF',
      '--app-nav-active': '#9F1239',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#9F1239',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#E11D48',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'solid-dark-charcoal': {
    id: 'solid-dark-charcoal',
    name: 'Cyber Charcoal Dark',
    tagline: 'Sleek dark theme for night study and technical workshops',
    description: 'Dark Charcoal: #0F172A deep dark backdrop',
    category: 'solid',
    colors: ['#0F172A', '#1E293B', '#334155', '#38BDF8', '#F8FAFC'],
    bgPreview: '#0F172A',
    cssVars: {
      '--app-bg': '#0F172A',
      '--app-bg-image': 'none',
      '--app-surface': '#1E293B',
      '--app-surface-alt': '#334155',
      '--app-border': '#475569',
      '--app-primary': '#38BDF8',
      '--app-primary-hover': '#0284C7',
      '--app-primary-text': '#0F172A',
      '--app-secondary': '#94A3B8',
      '--app-accent': '#38BDF8',
      '--app-highlight': '#334155',
      '--app-text-title': '#F8FAFC',
      '--app-text-body': '#E2E8F0',
      '--app-text-muted': '#94A3B8',
      '--app-badge-bg': '#38BDF8',
      '--app-badge-text': '#0F172A',
      '--app-card-border': '#475569',
      '--app-nav-active': '#38BDF8',
      '--app-nav-active-text': '#0F172A',
      '--app-button-bg': '#38BDF8',
      '--app-button-text': '#0F172A',
      '--app-accent-btn': '#0EA5E9',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },

  // GRADIENT DESIGNS
  'gradient-arctic-aurora': {
    id: 'gradient-arctic-aurora',
    name: 'Arctic Aurora Gradient',
    tagline: 'Glacial cyan, arctic sky and gentle violet fade',
    description: 'Gradient: Sky Blue to Soft Lilac (135deg)',
    category: 'gradient',
    colors: ['#0284C7', '#38BDF8', '#818CF8', '#C7D2FE', '#E0F2FE'],
    bgPreview: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #ede9fe 100%)',
    cssVars: {
      '--app-bg': '#e0f2fe',
      '--app-bg-image': 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #ede9fe 100%)',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#E8F0FE',
      '--app-border': '#BFDBFE',
      '--app-primary': '#1D4ED8',
      '--app-primary-hover': '#1E40AF',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#3B82F6',
      '--app-accent': '#6366F1',
      '--app-highlight': '#DBEAFE',
      '--app-text-title': '#1E3A8A',
      '--app-text-body': '#1E293B',
      '--app-text-muted': '#475569',
      '--app-badge-bg': '#3B82F6',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#BFDBFE',
      '--app-nav-active': '#1D4ED8',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#1D4ED8',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#6366F1',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'gradient-sunset-glow': {
    id: 'gradient-sunset-glow',
    name: 'Sunset Horizon Glow',
    tagline: 'Warm apricot orange, soft peach and golden amber',
    description: 'Gradient: Warm Apricot to Golden Amber (135deg)',
    category: 'gradient',
    colors: ['#C2410C', '#EA580C', '#F97316', '#FED7AA', '#FFF7ED'],
    bgPreview: 'linear-gradient(135deg, #ffedd5 0%, #fee2e2 50%, #fef3c7 100%)',
    cssVars: {
      '--app-bg': '#ffedd5',
      '--app-bg-image': 'linear-gradient(135deg, #ffedd5 0%, #fee2e2 50%, #fef3c7 100%)',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#FFF1E0',
      '--app-border': '#FED7AA',
      '--app-primary': '#C2410C',
      '--app-primary-hover': '#9A3412',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#EA580C',
      '--app-accent': '#D97706',
      '--app-highlight': '#FFEDD5',
      '--app-text-title': '#7C2D12',
      '--app-text-body': '#431407',
      '--app-text-muted': '#9A3412',
      '--app-badge-bg': '#EA580C',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#FED7AA',
      '--app-nav-active': '#C2410C',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#C2410C',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#D97706',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'gradient-oceanic-abyss': {
    id: 'gradient-oceanic-abyss',
    name: 'Oceanic Aqua Marine',
    tagline: 'Vibrant turquoise, marine cyan and mint coastal wash',
    description: 'Gradient: Aqua Cyan to Seafoam Mint (135deg)',
    category: 'gradient',
    colors: ['#0E7490', '#06B6D4', '#2DD4BF', '#A5F3FC', '#ECFEFF'],
    bgPreview: 'linear-gradient(135deg, #cffafe 0%, #bae6fd 50%, #a7f3d0 100%)',
    cssVars: {
      '--app-bg': '#cffafe',
      '--app-bg-image': 'linear-gradient(135deg, #cffafe 0%, #bae6fd 50%, #a7f3d0 100%)',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#E0F9FB',
      '--app-border': '#A5F3FC',
      '--app-primary': '#0E7490',
      '--app-primary-hover': '#155E75',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#06B6D4',
      '--app-accent': '#0D9488',
      '--app-highlight': '#CFFAFE',
      '--app-text-title': '#164E63',
      '--app-text-body': '#083344',
      '--app-text-muted': '#155E75',
      '--app-badge-bg': '#0891B2',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#A5F3FC',
      '--app-nav-active': '#0E7490',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#0E7490',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#0D9488',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'gradient-emerald-dusk': {
    id: 'gradient-emerald-dusk',
    name: 'Emerald Mist Twilight',
    tagline: 'Soft spring jade, mist teal and serene blue horizon',
    description: 'Gradient: Spring Emerald to Mist Teal (135deg)',
    category: 'gradient',
    colors: ['#065F46', '#10B981', '#34D399', '#A7F3D0', '#ECFDF5'],
    bgPreview: 'linear-gradient(135deg, #d1fae5 0%, #ccfbf1 50%, #dbeafe 100%)',
    cssVars: {
      '--app-bg': '#d1fae5',
      '--app-bg-image': 'linear-gradient(135deg, #d1fae5 0%, #ccfbf1 50%, #dbeafe 100%)',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#E2F9EE',
      '--app-border': '#A7F3D0',
      '--app-primary': '#065F46',
      '--app-primary-hover': '#064E3B',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#059669',
      '--app-accent': '#10B981',
      '--app-highlight': '#D1FAE5',
      '--app-text-title': '#022C22',
      '--app-text-body': '#064E3B',
      '--app-text-muted': '#047857',
      '--app-badge-bg': '#10B981',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#A7F3D0',
      '--app-nav-active': '#065F46',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#065F46',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#10B981',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'gradient-royal-twilight': {
    id: 'gradient-royal-twilight',
    name: 'Royal Twilight Iris',
    tagline: 'Sophisticated royal indigo and orchid purple glow',
    description: 'Gradient: Royal Indigo to Orchid Lavender (135deg)',
    category: 'gradient',
    colors: ['#4338CA', '#6366F1', '#A855F7', '#DDD6FE', '#EEF2FF'],
    bgPreview: 'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 50%, #f3e8ff 100%)',
    cssVars: {
      '--app-bg': '#e0e7ff',
      '--app-bg-image': 'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 50%, #f3e8ff 100%)',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#ECEFFE',
      '--app-border': '#C7D2FE',
      '--app-primary': '#4338CA',
      '--app-primary-hover': '#3730A3',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#6366F1',
      '--app-accent': '#9333EA',
      '--app-highlight': '#E0E7FF',
      '--app-text-title': '#312E81',
      '--app-text-body': '#1E1B4B',
      '--app-text-muted': '#4F46E5',
      '--app-badge-bg': '#6366F1',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#C7D2FE',
      '--app-nav-active': '#4338CA',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#4338CA',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#9333EA',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'gradient-cyber-night': {
    id: 'gradient-cyber-night',
    name: 'Cyber Neon Horizon',
    tagline: 'Deep dark indigo with electric neon cyan accents',
    description: 'Gradient: Deep Dark Slate to Cyber Indigo (135deg)',
    category: 'gradient',
    colors: ['#030712', '#0F172A', '#1E1B4B', '#38BDF8', '#F8FAFC'],
    bgPreview: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #030712 100%)',
    cssVars: {
      '--app-bg': '#0f172a',
      '--app-bg-image': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #030712 100%)',
      '--app-surface': '#1E293B',
      '--app-surface-alt': '#2D3748',
      '--app-border': '#4B5563',
      '--app-primary': '#38BDF8',
      '--app-primary-hover': '#0EA5E9',
      '--app-primary-text': '#0F172A',
      '--app-secondary': '#818CF8',
      '--app-accent': '#38BDF8',
      '--app-highlight': '#334155',
      '--app-text-title': '#F8FAFC',
      '--app-text-body': '#E2E8F0',
      '--app-text-muted': '#94A3B8',
      '--app-badge-bg': '#38BDF8',
      '--app-badge-text': '#0F172A',
      '--app-card-border': '#4B5563',
      '--app-nav-active': '#38BDF8',
      '--app-nav-active-text': '#0F172A',
      '--app-button-bg': '#38BDF8',
      '--app-button-text': '#0F172A',
      '--app-accent-btn': '#818CF8',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'gradient-emerald-matrix': {
    id: 'gradient-emerald-matrix',
    name: 'Matrix Obsidian Dark',
    tagline: 'Deep dark obsidian with phosphor emerald diagnostics',
    description: 'Gradient: Dark Forest to Deep Obsidian (135deg)',
    category: 'gradient',
    colors: ['#022C22', '#064E3B', '#065F46', '#34D399', '#ECFDF5'],
    bgPreview: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
    cssVars: {
      '--app-bg': '#022c22',
      '--app-bg-image': 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
      '--app-surface': '#064E3B',
      '--app-surface-alt': '#0A5C47',
      '--app-border': '#0D7A5F',
      '--app-primary': '#34D399',
      '--app-primary-hover': '#10B981',
      '--app-primary-text': '#022C22',
      '--app-secondary': '#6EE7B7',
      '--app-accent': '#34D399',
      '--app-highlight': '#0D7A5F',
      '--app-text-title': '#ECFDF5',
      '--app-text-body': '#D1FAE5',
      '--app-text-muted': '#A7F3D0',
      '--app-badge-bg': '#34D399',
      '--app-badge-text': '#022C22',
      '--app-card-border': '#0D7A5F',
      '--app-nav-active': '#34D399',
      '--app-nav-active-text': '#022C22',
      '--app-button-bg': '#34D399',
      '--app-button-text': '#022C22',
      '--app-accent-btn': '#10B981',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },
  'gradient-rose-gold': {
    id: 'gradient-rose-gold',
    name: 'Rose Gold Shimmer',
    tagline: 'Warm champagne rose and pastel blush glow',
    description: 'Gradient: Champagne Rose to Blush Frost (135deg)',
    category: 'gradient',
    colors: ['#9F1239', '#F43F5E', '#FB7185', '#FECDD3', '#FFF1F2'],
    bgPreview: 'linear-gradient(135deg, #ffe4e6 0%, #fce7f3 50%, #ffedd5 100%)',
    cssVars: {
      '--app-bg': '#ffe4e6',
      '--app-bg-image': 'linear-gradient(135deg, #ffe4e6 0%, #fce7f3 50%, #ffedd5 100%)',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#FFF1F2',
      '--app-border': '#FECDD3',
      '--app-primary': '#BE123C',
      '--app-primary-hover': '#9F1239',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#F43F5E',
      '--app-accent': '#E11D48',
      '--app-highlight': '#FFE4E6',
      '--app-text-title': '#4C0519',
      '--app-text-body': '#881337',
      '--app-text-muted': '#BE123C',
      '--app-badge-bg': '#E11D48',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#FECDD3',
      '--app-nav-active': '#BE123C',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#BE123C',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#E11D48',
      '--app-accent-btn-text': '#FFFFFF'
    }
  },

  // CUSTOM PALETTE PLACEHOLDER
  'custom': {
    id: 'custom',
    name: 'Custom User Theme',
    tagline: 'Personalized color or custom multi-stop gradient design',
    description: 'Custom Theme configured by the user',
    category: 'custom',
    colors: ['#2563EB', '#3B82F6', '#60A5FA', '#BFDBFE', '#EFF6FF'],
    bgPreview: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    cssVars: {
      '--app-bg': '#EFF6FF',
      '--app-bg-image': 'none',
      '--app-surface': '#FFFFFF',
      '--app-surface-alt': '#DBEAFE',
      '--app-border': '#93C5FD',
      '--app-primary': '#1D4ED8',
      '--app-primary-hover': '#1E40AF',
      '--app-primary-text': '#FFFFFF',
      '--app-secondary': '#3B82F6',
      '--app-accent': '#2563EB',
      '--app-highlight': '#BFDBFE',
      '--app-text-title': '#1E3A8A',
      '--app-text-body': '#1E293B',
      '--app-text-muted': '#475569',
      '--app-badge-bg': '#2563EB',
      '--app-badge-text': '#FFFFFF',
      '--app-card-border': '#93C5FD',
      '--app-nav-active': '#1D4ED8',
      '--app-nav-active-text': '#FFFFFF',
      '--app-button-bg': '#1D4ED8',
      '--app-button-text': '#FFFFFF',
      '--app-accent-btn': '#2563EB',
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

export function getSavedCustomSettings(): CustomThemeSettings {
  try {
    const raw = localStorage.getItem('cssential_custom_theme');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    mode: 'gradient',
    solidColor: '#e0f2fe',
    gradientStart: '#e0f2fe',
    gradientEnd: '#ede9fe',
    gradientAngle: 135,
    primaryColor: '#1d4ed8',
    surfaceMode: 'light'
  };
}

export function applyThemePalette(paletteId: ThemePaletteId): void {
  const root = document.documentElement;

  if (paletteId === 'custom') {
    const custom = getSavedCustomSettings();
    applyCustomTheme(custom);
    return;
  }

  const palette = THEME_PALETTES[paletteId] || THEME_PALETTES[DEFAULT_PALETTE_ID];

  root.setAttribute('data-theme', palette.id);

  Object.entries(palette.cssVars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });

  try {
    localStorage.setItem('cssential_palette', paletteId);
  } catch {}
}

export function applyCustomTheme(settings: CustomThemeSettings): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', 'custom');

  const isDark = settings.surfaceMode === 'dark';
  const surface = isDark ? '#1E293B' : '#FFFFFF';
  const surfaceAlt = isDark ? '#334155' : '#F1F5F9';
  const border = isDark ? '#475569' : '#CBD5E1';
  const titleText = isDark ? '#F8FAFC' : '#0F172A';
  const bodyText = isDark ? '#E2E8F0' : '#334155';
  const mutedText = isDark ? '#94A3B8' : '#64748B';

  let bg = settings.solidColor;
  let bgImage = 'none';

  if (settings.mode === 'gradient') {
    bg = settings.gradientStart;
    bgImage = `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientStart} 0%, ${settings.gradientEnd} 100%)`;
  }

  root.style.setProperty('--app-bg', bg);
  root.style.setProperty('--app-bg-image', bgImage);
  root.style.setProperty('--app-surface', surface);
  root.style.setProperty('--app-surface-alt', surfaceAlt);
  root.style.setProperty('--app-border', border);
  root.style.setProperty('--app-primary', settings.primaryColor);
  root.style.setProperty('--app-primary-hover', settings.primaryColor);
  root.style.setProperty('--app-primary-text', '#FFFFFF');
  root.style.setProperty('--app-text-title', titleText);
  root.style.setProperty('--app-text-body', bodyText);
  root.style.setProperty('--app-text-muted', mutedText);
  root.style.setProperty('--app-nav-active', settings.primaryColor);
  root.style.setProperty('--app-nav-active-text', '#FFFFFF');
  root.style.setProperty('--app-button-bg', settings.primaryColor);
  root.style.setProperty('--app-button-text', '#FFFFFF');
  root.style.setProperty('--app-card-border', border);

  try {
    localStorage.setItem('cssential_palette', 'custom');
    localStorage.setItem('cssential_custom_theme', JSON.stringify(settings));
  } catch {}
}
