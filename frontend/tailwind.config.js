/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          charcoal: "#0F172A",
          slate: "#1E293B",
          blue: "#2563EB",
          "blue-vivid": "#3B82F6",
          "blue-dark": "#1D4ED8",
          "blue-light": "#EFF6FF",
          "blue-border": "#BFDBFE",
        },
        charcoal: {
          950: "#020617",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
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
