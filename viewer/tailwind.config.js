/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0a',
          surface: '#1a1a1a',
          card: '#242424',
          border: '#333333',
          text: '#e5e5e5',
          muted: '#a0a0a0',
        },
      },
    },
  },
  plugins: [],
}

