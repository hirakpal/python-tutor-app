/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        surface: '#1E293B',
        accent: '#FBBF24',
        text: '#F1F5F9',
        beginner: '#10B981',
        average: '#3B82F6',
        expert: '#A855F7',
        god: '#EF4444',
      },
      boxShadow: {
        glow: '0 20px 45px rgba(15, 23, 42, 0.35)',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
