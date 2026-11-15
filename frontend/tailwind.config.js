/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FFFDF7',
          100: '#FBF4E6',
          200: '#F6EAD3',
          300: '#EBD8B7',
          400: '#D8C096',
        },
        wood: {
          light: '#D9A566',
          DEFAULT: '#B9824A',
          dark: '#8A5A33',
          deep: '#5A381B',
        },
        brass: {
          light: '#F3D27E',
          DEFAULT: '#E6BC5C',
          dark: '#C9972B',
          antique: '#9B721A',
        },
        ink: {
          light: '#5A4A57',
          DEFAULT: '#3A2E2A',
          dark: '#2B2235',
        },
        jewel: {
          emerald: '#1F8A70',
          ruby: '#C2334D',
          sapphire: '#2F5DA8',
          amethyst: '#7A4FB5',
          saffron: '#F0A21B',
          teal: '#17939A',
          rose: '#E26D8B',
          forest: '#3F7D3A',
          terracotta: '#D2693C',
        },
        nightwatch: {
          bg: '#1E152A',
          plum: '#2A1B3D',
          accent: '#E6BC5C',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'parchment': '0 4px 20px -2px rgba(90, 56, 27, 0.08), 0 2px 6px -1px rgba(90, 56, 27, 0.04)',
        'parchment-lg': '0 12px 32px -4px rgba(90, 56, 27, 0.12), 0 4px 12px -2px rgba(90, 56, 27, 0.06)',
        'book': '4px 6px 16px rgba(43, 34, 53, 0.15)',
        'book-hover': '8px 16px 28px rgba(43, 34, 53, 0.22)',
      },
      borderRadius: {
        'parchment': '18px',
      }
    },
  },
  plugins: [],
}
