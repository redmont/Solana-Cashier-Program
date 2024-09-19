import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      screens: {
        xs: '32rem',
        sm: '48rem',
        md: '75rem',
        lg: '92rem',
        xl: '112rem',
      },
      colors: {
        text: '#FEFEFE',
        border: 'hsl(250, 21%, 15%)',
        input: 'hsl(240, 5.9%, 90%)',
        ring: 'hsl(240, 10%, 3.9%)',
        background: '#010101',
        foreground: '#0E0D15',
        gold: '#EACC81',
        primary: {
          DEFAULT: '#4CDC88',
          foreground: 'black',
          50: 'hsl(153, 8%, 98%)',
          100: 'hsl(154, 16%, 95%)',
          200: 'hsl(154, 33%, 90%)',
          300: 'hsl(154, 53%, 85%)',
          400: 'hsl(154, 75%, 80%)',
          500: 'hsl(158, 95%, 82%)',
          600: 'hsl(156, 95%, 73%)',
          700: 'hsl(154, 95%, 62%)',
          800: 'hsl(157, 94%, 46%)',
          900: 'hsl(164, 92%, 26%)',
          950: 'hsl(168, 93%, 16%)',
        },
        secondary: {
          DEFAULT: 'hsl(31, 92%, 68%)',
          foreground: 'black',
        },
        destructive: {
          DEFAULT: '#A62F2F',
          foreground: 'white',
        },
        muted: {
          DEFAULT: 'hsl(240, 3.8%, 46.1%)',
          foreground: 'hsl(240, 3.8%, 46.1%)',
        },
        accent: {
          DEFAULT: 'hsl(240, 4.8%, 95.9%)',
          foreground: 'hsl(240, 5.9%, 10%)',
        },
        popover: {
          DEFAULT: '#0E0D15',
          foreground: '#FEFEFE',
        },
        card: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(240, 10%, 3.9%)',
        },
        chart: {
          1: 'hsl(12, 76%, 61%)',
          2: 'hsl(173, 58%, 39%)',
          3: 'hsl(197, 37%, 24%)',
          4: 'hsl(43, 74%, 66%)',
          5: 'hsl(27, 87%, 67%)',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      keyframes: {
        'figure-8': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(50px, 50px)' },
          '50%': { transform: 'translate(0, 100px)' },
          '75%': { transform: 'translate(-50px, 50px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        progress: {
          from: { width: '100%' },
          to: { width: '0%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
        progress: 'progress 1s linear forwards',
      },
      clipPath: {
        mypolygon: 'polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 1rem))',
        skewed: 'polygon(84% 0, 100% 0, 15% 100%, 0 100%)',
      },
    },
  },
  safelist: ['grid-cols-7', 'grid-cols-8'],
  plugins: [require('tailwindcss-animate'), require('tailwind-clip-path')],
} satisfies Config;

export default config;
