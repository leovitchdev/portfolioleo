/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        lemon: '#FBEA69',
        ink: '#0B0B0B',
        ash: '#7F7E7E',
        mist: '#E4E4E4',
        paper: '#F9F9F9',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        body: ['Inter Tight', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
