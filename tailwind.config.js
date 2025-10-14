/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Fun road trip color palette - pastels and vibrant accents
      colors: {
        'sky-pastel': '#B8E6F5',
        'orange-pastel': '#FFD5B5',
        'yellow-pastel': '#FFF4CC',
        'coral': '#FF6B6B',
        'teal': '#4ECDC4',
        'purple-pastel': '#C7B8EA',
      },
      // Custom animations for the moped and markers
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'exhaust': 'exhaust 1.5s ease-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        exhaust: {
          '0%': {
            opacity: '0.8',
            transform: 'scale(0.5) translateX(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(1.5) translateX(-20px)',
          },
        },
      },
    },
  },
  plugins: [],
}
