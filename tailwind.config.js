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
        // Legacy keys kept for backwards-compatibility with existing class
        // references across the app, retuned to the new warm-neutral,
        // low-stimulation palette instead of stark black/white.
        'pure-black': '#000000',
        'pure-white': '#ffffff',
        'soft-gray': '#f5f4f1',
        'border-gray': '#e9e6df',
        // Primary action accent: warm terracotta. Warm hues read as
        // human/energetic without the alarm connotation of red, and are
        // used sparingly (only for the single primary action per screen)
        // so the "do this next" signal stays unambiguous.
        'orange': {
          50: '#fdf3ee',
          100: '#fbe4d8',
          200: '#f6c6ac',
          300: '#f0a37c',
          400: '#ea8055',
          500: '#e2603a',
          600: '#c94a29',
          700: '#a53a21',
          800: '#7e2d1a',
          900: '#5c2114',
        },
        'ofa-ink': '#1c1b19',
        'ofa-charcoal': '#2a2822',
        'ofa-slate': '#57534a',
        'ofa-mist': '#88837a',
        'ofa-cloud': '#aba69c',
        'ofa-pearl': '#e9e6df',
        'ofa-snow': '#f7f5f1',
        'ofa-cream': '#fbfaf7',
        'ofa-accent': '#e2603a',
        'ofa-accent-deep': '#c94a29',
        'ofa-calm': '#5f7d78',
        'ofa-wisdom': '#2a2822',
        // New semantic families for psychology-led states. Kept separate
        // from the action accent so color itself carries meaning:
        // terracotta = "act on this", sage = "growth / momentum / done",
        // slate-blue = "focus / calm / informational".
        'growth': {
          50: '#f0f5ee',
          100: '#dce9d7',
          200: '#b7d3ab',
          300: '#8fba7f',
          400: '#6fa25c',
          500: '#588a47',
          600: '#456e37',
          700: '#37562c',
        },
        'focus-blue': {
          50: '#eef3f4',
          100: '#d7e3e5',
          200: '#aec7cb',
          300: '#82a7ad',
          400: '#5d8a91',
          500: '#456e75',
          600: '#37585e',
          700: '#2b464b',
        },
      },
      fontFamily: {
        // Serif display reserved for the marketing/landing surfaces only
        // (scoped under .landing) where a little theatre helps conversion.
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'serif': ['Playfair Display', 'serif'],
        // The product itself always uses Inter: a single, highly legible
        // typeface everywhere in-app removes a source of visual noise and
        // lets people scan screens by shape/weight instead of re-parsing
        // fonts, which is one of the cheapest wins for cognitive load.
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        'tight-head': '-0.03em',
      },
      borderRadius: {
        // Softer, more rounded corners read as lower-threat / friendlier
        // to the visual system than sharp rectangles - used consistently
        // instead of the previous mix of sm/md/lg values.
        'xl2': '1.125rem',
        '2.5xl': '1.375rem',
      },
      boxShadow: {
        'calm-sm': '0 1px 2px rgba(28, 27, 25, 0.04), 0 1px 1px rgba(28, 27, 25, 0.03)',
        'calm-md': '0 4px 16px rgba(28, 27, 25, 0.06), 0 2px 6px rgba(28, 27, 25, 0.04)',
        'calm-lg': '0 12px 32px rgba(28, 27, 25, 0.10), 0 4px 12px rgba(28, 27, 25, 0.05)',
        'focus-ring': '0 0 0 3px rgba(226, 96, 58, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        // Gentle, low-amplitude motion for reward moments (task complete,
        // streak increment) - a quick "pop" gives a small dopamine cue
        // without becoming a distraction the way large bounces would.
        'pop': 'pop 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'rise': 'rise 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'breathe': 'breathe 3.5s ease-in-out infinite',
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
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
