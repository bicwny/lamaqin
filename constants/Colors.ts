
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
    text: '#2F4F4F',
    background: '#F5F5DC',
    tint: tintColorLight,
    icon: '#8B4513',
    tabIconDefault: '#696969',
    tabIconSelected: tintColorLight,
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
