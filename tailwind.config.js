/** @type {import('tailwindcss').Config} */
export default { darkMode: 'class', content: ['./index.html', './App.tsx', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: {
  colors: { primary: { DEFAULT: 'var(--color-primary)', hover: 'var(--color-primary-hover)' }, success: '#34C759', warning: '#FF9500', danger: '#FF3B30', holiday: '#5856D6', info: '#8E8E93' },
  boxShadow: { soft: '0 1px 3px rgb(0 0 0 / .05), 0 2px 8px rgb(0 0 0 / .05)' },
  animation: { 'fade-in': 'fadeIn .2s ease-out forwards' }, keyframes: { fadeIn: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } } },
} }, plugins: [] };
