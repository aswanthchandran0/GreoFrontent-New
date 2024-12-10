/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing:{
      'dvh':'100dvh', 
      },
     colors:{
      text:{
        black:'#000',
        white:'#FFFFFF',
        Grayish:'#706D6F',
        darkGray:'#8F8E90',
        charcoal: '#363435',
        EerieBlack:'#1B191B',
        lavenderGray: '#A09DA1',
        deepViolet:'#4d2d64',
        lavenderPurple:'#976aa1',
        PurpleHeart:'#673872',
        green:'#4CAF50'
      },
      background:{
        light:'#FFFFFF',
        dark:'#121212',
        PurpleHeart:'#673872',
        EerieBlack:'#1B191B',
        charcoal: '#363435',
        customGray: '#1a1a1a',
        customDarkGray: '#1f1f1f',
        Grayish:'#706D6F',
      }
     },
     fontFamily:{
      outfit: ['Outfit', 'sans-serif'],
      golos:['Golos', 'sans-serif'],
      zilla:['Zilla Slab'], 
     }
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}