/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0e17',
          darker: '#05080f',
          light: '#1a1f2e',
          accent: '#00ff88',
          accentHover: '#00cc6a',
          danger: '#ff4757',
          warning: '#ffa502',
          info: '#2ed573',
          purple: '#a55eea',
          blue: '#3742fa'
        }
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
