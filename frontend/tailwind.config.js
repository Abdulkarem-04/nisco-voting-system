/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nigerian Flag Green
        nisco: {
          green: '#008751',
          light: '#e6f3ed',
          dark: '#00663d'
        }
      }
    },
  },
  plugins: [],
}