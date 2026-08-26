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
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
        },
        indigo: {
          600: "#4F46E5",
          500: "#6366F1",
          50: "#EEF2F6",
        },
        amber: {
          600: "#D97706",
          500: "#F59E0B",
          50: "#FEF3C7",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      }
    },
  },
  plugins: [],
}
