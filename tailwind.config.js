/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3B82F6', // Blue 500
          DEFAULT: '#2564CF', // MS ToDo Blue
          dark: '#1D4ED8', // Blue 700
          subtle: '#EFF6FF', // Blue 50 (Backgrounds)
        },
        // Semantic color system for consistent theming
        background: {
          light: '#F8FAFC', // Slate 50 - Premium Cool White
          dark: '#0F172A'   // Slate 900 - Deep Professional Navy/Black
        },
        surface: {
          light: '#FFFFFF', // Pure White
          dark: '#1E293B',  // Slate 800 - Lighter than background
          hover: '#F1F5F9', // Slate 100
          hoverDark: '#334155' // Slate 700
        },
        border: {
          light: '#E2E8F0', // Slate 200
          dark: '#334155',  // Slate 700
          highlight: '#BFDBFE' // Blue 200
        },
        text: {
          main: '#0F172A', // Slate 900
          secondary: '#475569', // Slate 600
          darkMain: '#F8FAFC', // Slate 50
          darkSecondary: '#94A3B8' // Slate 400
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'float': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(37, 100, 207, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}