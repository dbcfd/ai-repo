/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // https://coolors.co/palette/f72585-b5179e-7209b7-560bad-480ca8-3a0ca3-3f37c9-4361ee-4895ef-4cc9f0
      colors: {
        'blue-purple': '#3A0CA3',
        'blue-purple-light': '#3F37C9',
        'blue': '#4361EE',
        'light-blue': '#4895EF',
        'aqua': '#4CC9F0',
        'purple': '#480CA8',
        'dark-pink': '#B5179E',
        'pink': '#F72585'
      }
    }
  },
  plugins: [],
}
