/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#020617",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
        },
        indigo: {
          700: "#4338CA",
          600: "#4F46E5",
          500: "#6366F1",
          50: "#EEF2FF",
        },
        amber: {
          600: "#D97706",
          500: "#F59E0B",
          100: "#FEF3C7",
          50: "#FFFBEB",
        }
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Manrope", "sans-serif"],
        outfit: ["Manrope", "sans-serif"],
      }
    },
  },
  plugins: [],
}
