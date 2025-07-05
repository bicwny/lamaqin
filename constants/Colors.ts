/**
 * Buddhist Practice Tracking App Color Scheme
 * Colors inspired by Buddhist symbolism and peaceful design
 */

const tintColorLight = '#D4AF37'; // Golden color for Buddhist theme
const tintColorDark = '#F5F5DC';  // Beige

export const Colors = {
  // Primary color scheme
  primary: '#D4AF37',      // Golden - enlightenment
  secondary: '#8B4513',    // Brown - earth/stability
  accent: '#FF6B35',       // Orange - energy/compassion
  background: '#FFFFFF',   // White - purity and peace
  surface: '#FFFFFF',      // White - purity
  text: '#2F4F4F',         // Dark slate gray
  textSecondary: '#696969', // Dim gray
  success: '#228B22',      // Forest green
  warning: '#FF8C00',      // Dark orange
  error: '#DC143C',        // Crimson

  // Tab-specific colors
  study: '#4169E1',        // Royal blue - wisdom
  practice: '#D4AF37',     // Golden - practice
  mindfulness: '#FF69B4',  // Hot pink - heart
  stats: '#32CD32',        // Lime green - growth/progress
  profile: '#8A2BE2',      // Blue violet - personal

  light: {
    text: '#2F4F4F',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#696969',
    tabIconSelected: tintColorLight,
    surface: '#FFFFFF',
    primary: '#D4AF37',
    secondary: '#2F4F4F',
    textSecondary: '#696969',
    practice: '#D4AF37',
    study: '#4682B4',
    mindfulness: '#FF69B4',
    stats: '#32CD32',
    profile: '#D4AF37',
  },
  dark: {
    text: '#F5F5DC',
    background: '#2F4F4F',
    tint: tintColorDark,
    icon: '#D4AF37',
    tabIconDefault: '#8B4513',
    tabIconSelected: tintColorDark,
  },
};