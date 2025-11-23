/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: '#0f0f23', // Deep space purple-black
          surface: '#1e1e3e', // Lighter purple-blue
          card: '#1a1a2e', // Darker grey-purple for better text contrast
          border: '#7c3aed', // Brighter cosmic purple
          text: '#f3e8ff', // Brighter cosmic white
          muted: '#c4b5fd', // Lighter cosmic blue
          accent: '#a78bfa', // Vibrant purple
          nebula: '#818cf8', // Nebula blue
          star: '#fbbf24', // Star gold
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)',
        'nebula-gradient': 'linear-gradient(135deg, #533483 0%, #6366f1 50%, #8b5cf6 100%)',
        'space-gradient': 'radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a1a 100%)',
      },
    },
  },
  plugins: [],
}

