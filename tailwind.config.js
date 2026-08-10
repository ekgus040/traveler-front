import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "Noto Sans KR", "system-ui", "sans-serif"],
      },
    },
  },
  daisyui: {
    themes: [
      {
        traveler: {
          primary: "#FF7B59",
          secondary: "#4ECDC4",
          accent: "#6FCEF7",
          neutral: "#2D3436",
          "base-100": "#FFF6EC",
          "base-200": "#FFE8D6",
          "base-300": "#F2D8C6",
          "base-content": "#2D3436",
          info: "#6FCEF7",
          success: "#16a34a",
          warning: "#FFD93D",
          error: "#dc2626",
        },
      },
    ],
  },
  plugins: [daisyui],
};
