/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Deep civic navy — authority, trust, government
        civic: {
          50: "#EEF3F8",
          100: "#D6E2EE",
          200: "#AEC5DD",
          300: "#7FA1C6",
          400: "#4A73A0",
          500: "#28507F",
          600: "#1E3A5F",
          700: "#182F4C",
          800: "#12233A",
          900: "#0C1826",
        },
        // Teal — action, reporting, "go"
        signal: {
          50: "#ECF9F7",
          100: "#D1F0EB",
          200: "#A3E1D7",
          300: "#6FCBBD",
          400: "#3FAE9D",
          500: "#2A9D8F",
          600: "#227E73",
          700: "#1C645C",
        },
        // Coral — severity / priority accents, used sparingly
        alert: {
          100: "#FBE4DC",
          300: "#F2A088",
          500: "#E76F51",
          600: "#C9573B",
        },
        ink: {
          900: "#151A23",
          700: "#333B49",
          500: "#5B6472",
          300: "#9AA3B0",
          100: "#E4E8ED",
        },
        paper: "#F6F8FA",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(12,24,38,0.04), 0 8px 24px -8px rgba(12,24,38,0.12)",
        lift: "0 12px 32px -12px rgba(12,24,38,0.28)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
