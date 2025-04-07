/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae0ff',
          300: '#7cc5ff',
          400: '#38a5ff',
          500: '#0088ff',
          600: '#0070e0',
          700: '#0057b8',
          800: '#004997',
          900: '#00397d',
        },
        secondary: {
          50: '#f3f1ff',
          100: '#ebe5ff',
          200: '#d9ceff',
          300: '#bda8ff',
          400: '#9f7aff',
          500: '#8146ff',
          600: '#742df5',
          700: '#6422e0',
          800: '#551dc7',
          900: '#471ca0',
        },
        dark: {
          50: '#f6f6f9',
          100: '#ecedf2',
          200: '#d5d7e3',
          300: '#b0b5ca',
          400: '#8489a8',
          500: '#62678a',
          600: '#4d5170',
          700: '#3e415b',
          800: '#34374f',
          900: '#121528',
          950: '#0a0c1a',
        },
      },
      animation: {
        'gradient-x': 'gradient-x 10s ease infinite',
        'gradient-y': 'gradient-y 10s ease infinite',
        'gradient-xy': 'gradient-xy 10s ease infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        blob: 'blob 7s infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)'
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)'
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)'
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)'
          }
        },
        fadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      backgroundImage: {
        'tech-pattern': "url('/src/assets/tech-pattern.svg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'neon': '0 0 5px theme(colors.primary.400), 0 0 20px theme(colors.primary.300)',
        'neon-secondary': '0 0 5px theme(colors.secondary.400), 0 0 20px theme(colors.secondary.300)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
