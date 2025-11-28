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
        obra: {
          green: '#10B981', // Emerald 500
          dark: '#064E3B',  // Emerald 900
          light: '#D1FAE5', // Emerald 100
        },
        alert: {
          orange: '#F59E0B', // Amber 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}