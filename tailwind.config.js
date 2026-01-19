/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pure-black': '#000000',
        'pure-white': '#ffffff',
        'soft-gray': '#f5f5f7',
        'border-gray': '#eeeeee',
        'orange': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        'ofa-ink': '#000000',
        'ofa-charcoal': '#1a1a1a',
        'ofa-slate': '#404040',
        'ofa-mist': '#808080',
        'ofa-cloud': '#a0a0a0',
        'ofa-pearl': '#e5e5e5',
        'ofa-snow': '#f5f5f5',
        'ofa-cream': '#ffffff',
        'ofa-accent': '#f97316',
        'ofa-accent-deep': '#ea580c',
        'ofa-calm': '#808080',
        'ofa-wisdom': '#1a1a1a',
      },
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        'tight-head': '-0.03em',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
