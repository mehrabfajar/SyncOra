/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        ink: '#0f0e17',
        paper: '#fffffe',
        accent: '#f25f4c',
        muted: '#a7a9be',
        surface: '#ff8906',
        yes: '#2cb67d',
        maybe: '#f9bc60',
        no: '#e53170',
      }
    }
  },
  plugins: []
}
