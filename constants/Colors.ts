/**
 * Buddhist Practice Tracking App Color Scheme
 * Colors inspired by Buddhist symbolism and peaceful design
 */

const tintColorLight = '#D4AF37'; // Golden
const tintColorDark = '#F5F5DC';  // Beige

export const Colors = {
  // Primary color scheme
  primary: '#D4AF37',      // Golden - enlightenment
  secondary: '#8B4513',    // Brown - earth/stability
  accent: '#FF6B35',       // Orange - energy/compassion
  background: '#F5F5DC',   // Beige - peaceful
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
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    cardBackground: '#F9FAFB',
    border: '#E5E7EB',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    cardBackground: '#1F2937',
    border: '#374151',
  },
};