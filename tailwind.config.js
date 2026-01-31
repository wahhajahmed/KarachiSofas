// Root Tailwind config shared by frontend and admin apps
// Each app also has its own tailwind.config.js extending this if desired.

module.exports = {
  content: [
    "./frontend/pages/**/*.{js,jsx}",
    "./frontend/components/**/*.{js,jsx}",
    "./admin/pages/**/*.{js,jsx}",
    "./admin/components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#d4af37", // AUF gold tone
          dark: "#b58f1f"
        },
        secondary: "#0b1a2b" // deep navy background
      }
    }
  },
  plugins: []
};
