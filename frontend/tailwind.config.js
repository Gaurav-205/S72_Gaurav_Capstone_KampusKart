/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ["'Work Sans'", 'ui-sans-serif', 'system-ui'],
      },
      fontSize: {
        'h1': ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['clamp(1.5rem, 4vw, 2.25rem)', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['clamp(1.25rem, 3vw, 1.875rem)', { lineHeight: '1.4', fontWeight: '600' }],
        'h4': ['clamp(1.125rem, 2.5vw, 1.5rem)', { lineHeight: '1.4', fontWeight: '600' }],
        'h5': ['clamp(1rem, 2vw, 1.25rem)', { lineHeight: '1.5', fontWeight: '500' }],
        'body': ['clamp(0.875rem, 1.5vw, 1rem)', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        'navbar': '72px',
      },
      colors: {
        'deep-purple': {
          50: '#f3f0fa', 100: '#e0d6f5', 200: '#c1aeea', 300: '#a285df', 400: '#835dd4', 500: '#6434c9', 600: '#5029a1', 700: '#3c1f79', 800: '#281451', 900: '#140a28',
        },
        'royal-purple': {
          50: '#f5f2fa', 100: '#e5d8f5', 200: '#cbaef0', 300: '#b185eb', 400: '#975be6', 500: '#7d31e1', 600: '#6427b4', 700: '#4b1d87', 800: '#321359', 900: '#190a2c',
        },
        'hot-pink': {
          50: '#fdf0f7', 100: '#fad6eb', 200: '#f5aed7', 300: '#f085c3', 400: '#eb5caf', 500: '#e6339b', 600: '#b4297c', 700: '#871f5d', 800: '#59143e', 900: '#2c0a1f',
        },
        'coral-orange': {
          50: '#fff4f0', 100: '#ffe0d6', 200: '#ffc1ae', 300: '#ffa285', 400: '#ff835c', 500: '#ff6434', 600: '#cc5029', 700: '#993c1f', 800: '#662814', 900: '#33140a',
        },
        'goldenrod': {
          50: '#fff9f0', 100: '#fff0d6', 200: '#ffe1ae', 300: '#ffd285', 400: '#ffc35c', 500: '#ffb434', 600: '#cc9029', 700: '#996c1f', 800: '#664814', 900: '#33240a',
        },
        'ivory-cream': '#F5F5DA',
        'crimson-wine': '#7B021D',
        orange: {
          DEFAULT: '#F05A25',
        },
        blue: {
          DEFAULT: '#3FA9F6',
        },
        cream: {
          DEFAULT: '#EFE1CF',
        },
        black: {
          DEFAULT: '#000000',
        },
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
      },
    },
  },
  plugins: [],
}

