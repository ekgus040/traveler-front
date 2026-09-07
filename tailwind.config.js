import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard Variable", "Pretendard", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#191F28",
        sub: "#4E5968",
        muted: "#8B95A1",
        line: "#E5E8EB",
        "line-strong": "#D1D6DB",
        surface: "#F7F8FA",
        brand: {
          DEFAULT: "#1B64DA",
          hover: "#1957BC",
          weak: "#EDF3FE",
          border: "#C9DCFA",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(25,31,40,.04), 0 6px 18px rgba(25,31,40,.05)",
        pop: "0 8px 28px rgba(25,31,40,.10)",
      },
    },
  },
  daisyui: {
    themes: [
      {
        traveler: {
          primary: "#1B64DA",
          secondary: "#4E5968",
          accent: "#1B64DA",
          neutral: "#191F28",
          "base-100": "#FFFFFF",
          "base-200": "#F7F8FA",
          "base-300": "#E5E8EB",
          "base-content": "#191F28",
          info: "#1B64DA",
          success: "#0F9960",
          warning: "#E8A33D",
          error: "#E5484D",
        },
      },
    ],
  },
  plugins: [daisyui],
};
