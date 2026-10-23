/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-bg': '#071711',
        'eco-surface': '#0D241B',
        'eco-card': '#123126',
        'eco-card-hover': '#183F31',
        'eco-green': '#4ADE80',
        'eco-emerald': '#10B981',
        'eco-lime': '#BEF264',
        'eco-text': '#F8FAFC',
        'eco-muted': '#A7B8AE',
        'eco-amber': '#F59E0B',
        'eco-red': '#EF4444',
        'eco-border': 'rgba(74, 222, 128, 0.15)',
        'eco-border-glow': 'rgba(74, 222, 128, 0.4)'
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanLine 2.5s ease-in-out infinite',
        'float': 'floating 6s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.9' },
          '50%': { transform: 'translateY(95%)', opacity: '0.9' }
        },
        floating: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
