const shared = require('../tailwind.config');

module.exports = {
  ...shared,
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "../shared/**/*.{js,jsx}",
  ],
};
