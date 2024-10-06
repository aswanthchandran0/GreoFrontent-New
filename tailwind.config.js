/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
     colors:{
      text:{
        black:'#000',
        white:'#FFFFFF',
        Grayish:'#706D6F',
        darkGray:'#8F8E90',
        charcoal: '#363435',
        lavenderGray: '#A09DA1',
      },
      background:{
        light:'#FFFFFF',
        dark:'#121212'
      }
     },
     fontFamily:{
      outfit: ['Outfit', 'sans-serif'],
      golos:['Golos', 'sans-serif'],
      zilla:['Zilla Slab', 'serif'] 
     }
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}