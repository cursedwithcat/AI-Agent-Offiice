/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Prompt"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Approved Royal Blue Primary Hex
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a', // Deep Royal Navy
          950: '#0f172a',
        },
        growth: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981', // Emerald Growth
          600: '#059669',
          700: '#047857',
        },
        uni: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          500: '#8b5cf6',
          600: '#7c3aed', // University Violet
          700: '#6d28d9',
        },
        admin: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706', // Governance Amber
          700: '#b45309',
        }
      }
    },
  },
  plugins: [],
}
