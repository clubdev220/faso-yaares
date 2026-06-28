import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#009B4D',
          50: '#E6F7EE',
          100: '#C0EBD4',
          200: '#80D7A9',
          300: '#40C37E',
          400: '#00AF53',
          500: '#009B4D',
          600: '#007D3E',
          700: '#005F2F',
          800: '#004120',
          900: '#002310',
        },
        secondary: {
          DEFAULT: '#EF2B2D',
          50: '#FEE8E8',
          100: '#FBCBCC',
          200: '#F79799',
          300: '#F36365',
          400: '#EF4446',
          500: '#EF2B2D',
          600: '#CC1416',
          700: '#A00F11',
          800: '#740A0C',
          900: '#480507',
        },
        accent: {
          DEFAULT: '#FCD116',
          50: '#FFFDE6',
          100: '#FFF9BF',
          200: '#FFF280',
          300: '#FFEC40',
          400: '#FFE01A',
          500: '#FCD116',
          600: '#E0B400',
          700: '#B38E00',
          800: '#806800',
          900: '#4D3F00',
        },
        navy: {
          DEFAULT: '#1E40AF',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
