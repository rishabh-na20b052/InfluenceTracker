export interface CustomTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    success: string;
    successForeground: string;
    warning: string;
    warningForeground: string;
  };
  createdAt: number;
}

export const defaultThemes: CustomTheme[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#29ABE2',
      secondary: '#f1f5f9',
      accent: '#90EE90',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f8fafc',
      mutedForeground: '#64748b',
      border: '#e2e8f0',
      input: '#ffffff',
      ring: '#29ABE2',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      card: '#ffffff',
      cardForeground: '#0f172a',
      popover: '#ffffff',
      popoverForeground: '#0f172a',
      success: '#22c55e',
      successForeground: '#ffffff',
      warning: '#f59e0b',
      warningForeground: '#ffffff',
    },
    createdAt: Date.now(),
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#29ABE2',
      secondary: '#1e293b',
      accent: '#90EE90',
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#1e293b',
      mutedForeground: '#64748b',
      border: '#334155',
      input: '#1e293b',
      ring: '#29ABE2',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      card: '#1e293b',
      cardForeground: '#f8fafc',
      popover: '#1e293b',
      popoverForeground: '#f8fafc',
      success: '#22c55e',
      successForeground: '#ffffff',
      warning: '#f59e0b',
      warningForeground: '#ffffff',
    },
    createdAt: Date.now(),
  },
];

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Convert hex to HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to hex
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

// Validate hex color
export function isValidHex(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Validate RGB color
export function isValidRgb(r: number, g: number, b: number): boolean {
  return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
}

// Apply theme to CSS variables (using HSL format for Tailwind)
export function applyTheme(theme: CustomTheme): void {
  const root = document.documentElement;
  
  // Clear any existing custom theme classes
  root.classList.remove('custom-theme');
  
  // Apply each color as HSL values
  Object.entries(theme.colors).forEach(([key, hexValue]) => {
    const hsl = hexToHsl(hexValue);
    const hslString = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
    root.style.setProperty(`--${key}`, hslString);
  });
  
  // Add custom theme class to override default themes
  root.classList.add('custom-theme');
}

// Reset to default theme
export function resetToDefaultTheme(): void {
  const root = document.documentElement;
  root.classList.remove('custom-theme');
  
  // Clear any custom CSS variables
  const customProperties = [
    '--background', '--foreground', '--card', '--card-foreground',
    '--popover', '--popover-foreground', '--primary', '--primary-foreground',
    '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
    '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
    '--border', '--input', '--ring', '--success', '--success-foreground',
    '--warning', '--warning-foreground'
  ];
  
  customProperties.forEach(prop => {
    root.style.removeProperty(prop);
  });
}

// Save theme to localStorage
export function saveTheme(theme: CustomTheme): void {
  const savedThemes = getSavedThemes();
  const existingIndex = savedThemes.findIndex(t => t.id === theme.id);
  
  if (existingIndex >= 0) {
    savedThemes[existingIndex] = theme;
  } else {
    savedThemes.push(theme);
  }
  
  localStorage.setItem('custom-themes', JSON.stringify(savedThemes));
}

// Get saved themes from localStorage
export function getSavedThemes(): CustomTheme[] {
  try {
    const saved = localStorage.getItem('custom-themes');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Delete theme
export function deleteTheme(themeId: string): void {
  const savedThemes = getSavedThemes();
  const filtered = savedThemes.filter(t => t.id !== themeId);
  localStorage.setItem('custom-themes', JSON.stringify(filtered));
}

// Get all themes (default + saved)
export function getAllThemes(): CustomTheme[] {
  return [...defaultThemes, ...getSavedThemes()];
}

// Generate unique theme ID
export function generateThemeId(): string {
  return `theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
} 