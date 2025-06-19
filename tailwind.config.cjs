/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gruvbox: {
          dark: {
            bg: "#282828",
            fg: "#ebdbb2",
            red: "#FB4934",
            blue: "#458588",
            darkBlue: "#357578",
            grey: "#32302f",
            lightGrey: "#3c3836",
            appBar: "#32202f",
          },
        },
      },
    },
  },
  plugins: [],
};
