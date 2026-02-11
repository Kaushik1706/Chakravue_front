/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark': '#0a0a0a',
        'accent': '#D4A574',
        'gray-custom': '#8B8B8B',
        'border-dark': '#2a2a2a',
        'bg-dark': '#1a1a1a',
        'text-light': '#B8B8B8',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(212, 165, 116, 0.3)',
      },
      fontSize: {
        // Shift scale up for better readability
        'xs': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px (was 12px)
        'sm': ['1rem', { lineHeight: '1.5rem' }],         // 16px (was 14px)
        'base': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px (was 16px)
        'lg': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px (was 18px)
        'xl': ['1.5rem', { lineHeight: '2rem' }],         // 24px (was 20px)
        '2xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px (was 24px)
        '3xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px (was 30px)
      },
    },
  },
  plugins: [],
};
