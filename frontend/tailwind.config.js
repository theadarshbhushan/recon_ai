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
          navy: "#0A2540",
          "navy-light": "#14375A",
          "navy-dark": "#071A2E",
          gold: "#C9A227",
          "gold-light": "#E0B638",
          "gold-muted": "#FAF5E6",
          "gold-dark": "#A68218",
        },
        navy: {
          950: "#071A2E",
          900: "#0A2540",
          800: "#14375A",
          700: "#1E4770",
          600: "#335C87",
        },
        gold: {
          600: "#A68218",
          500: "#C9A227",
          400: "#E0B638",
          100: "#FDF8E7",
          50: "#FAF5E6",
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
