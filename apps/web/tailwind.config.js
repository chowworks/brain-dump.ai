/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FBF8F3',
        card: '#FFFDFA',
        ink: '#1A1614',
        muted: '#6B625C',
        rule: '#E5DDD2',
        clay: '#A8501A',
        claySoft: '#F6E7DF',
        sage: '#4A6B5C',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};
