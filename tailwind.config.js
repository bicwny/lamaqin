
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Using default NativeWind/Tailwind colors only
      // No custom colors needed - use bg-red-500, text-gray-700, etc.
    },
  },
  plugins: [],
}
