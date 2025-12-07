/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.html",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#0d9488',
          light: '#f0fdfa',
          dark: '#042f2e',
        },
      },
    },
  },
  plugins: [],
};
