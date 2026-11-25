/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb', // Fastwork classic vibrant blue
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
          DEFAULT: '#1a56db',
        },
        fastwork: {
          blue: '#0056fb',
          hover: '#0047d1',
          accent: '#00c389', // fresh teal/green
          dark: '#0f172a',
          light: '#f8fafc',
          border: '#e2e8f0',
          yellow: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Prompt', 'Kanit', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card-hover': '0 12px 24px -6px rgba(0, 86, 251, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
