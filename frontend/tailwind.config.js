// tailwind.config.js
const { heroui } = require("@heroui/theme");
import { heroui } from "@heroui/react";
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",

    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
],
  theme: {
    extend: {
      fontFamily: {
        ibm: ['"IBM Plex Sans"', "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
