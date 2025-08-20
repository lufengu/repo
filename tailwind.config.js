/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#007AFF',
        'brand-orange': '#FF6600',
        'ios-blue': '#007AFF',
        'brand-orange-light': '#FFE6DAFF',
        'ios-blue-pastel': '#CCE4FF',
      },
    },
  },
  plugins: [],
}

