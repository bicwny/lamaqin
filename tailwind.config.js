
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: '#da4347',
          light: '#e66a6d',
          dark: '#b8353a',
        },
        
        // Secondary colors
        secondary: '#2F4F4F',
        accent: '#FF6B35',
        
        // Text colors
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
        
        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        
        // Buddhist theme colors
        practice: '#da4347',
        study: '#da4347',
        mindfulness: '#da4347',
        stats: '#32CD32',
        profile: '#da4347',
      },
    },
  },
  plugins: [],
}
