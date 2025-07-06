
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  important: 'html',
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37',      // Golden - enlightenment
        secondary: '#8B4513',    // Brown - earth/stability
        accent: '#FF6B35',       // Orange - energy/compassion
        surface: '#FFFFFF',      // White - purity
        buddhist: {
          golden: '#D4AF37',
          brown: '#8B4513',
          orange: '#FF6B35',
          slate: '#2F4F4F',
          gray: '#696969',
        },
        practice: '#D4AF37',
        study: '#4169E1',
        mindfulness: '#FF69B4',
        stats: '#32CD32',
        profile: '#8A2BE2',
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
    },
  },
  plugins: [],
}
