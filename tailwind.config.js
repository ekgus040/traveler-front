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
          primary: "#F07A3B",
          secondary: "#2D9C8C",
          accent: "#1C2B4A",
          neutral: "#1C2B4A",
          "base-100": "#F9F7F2",
          "base-200": "#F0EDE8",
          "base-300": "#E8E4DC",
          "base-content": "#1C2B4A",
          info: "#2D9C8C",
          success: "#16a34a",
          warning: "#F07A3B",
          error: "#dc2626",
        },
      },
    ],
  },
  plugins: [daisyui],
};
