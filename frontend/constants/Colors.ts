/**
 * AIPhDWriter Color Palette
 * Based on design mockups - Purple/Blue gradient theme
 */

const tintColorLight = '#4F46E5';
const tintColorDark = '#818CF8';

export const Colors = {
  light: {
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#FFFFFF',
    backgroundSecondary: '#F3F4F6',
    backgroundTertiary: '#E5E7EB',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
    card: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    background: '#111827',
    backgroundSecondary: '#1F2937',
    backgroundTertiary: '#374151',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    border: '#374151',
    card: '#1F2937',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
  // Brand colors
  brand: {
    primary: '#4F46E5',
    primaryLight: '#818CF8',
    primaryDark: '#3730A3',
    secondary: '#7C3AED',
    secondaryLight: '#A78BFA',
    accent: '#06B6D4',
    gradient: {
      start: '#4F46E5',
      middle: '#7C3AED',
      end: '#06B6D4',
    },
  },
  // Pricing tier colors
  pricing: {
    short: '#4F46E5',
    standard: '#7C3AED',
    comprehensive: '#EC4899',
    dissertation: '#F59E0B',
  },
};

export default Colors;
