import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14213D",
          50: "#FFFFFF",
          100: "#FAF7F2",
          200: "#F2ECE0",
          300: "#E5E0D8",
          400: "#C4BCAD",
          500: "#8B93A1",
          600: "#5B6472",
          700: "#3A4250",
          800: "#232B3D",
          900: "#182036",
          950: "#14213D"
        },
        copper: {
          DEFAULT: "#C1440E",
          light: "#E2662A",
          dark: "#9A3609"
        },
        teal: {
          DEFAULT: "#2A6F77",
          light: "#4C9BA3",
          dark: "#1D4F55"
        }
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"]
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(20,33,61,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(20,33,61,0.06) 1px, transparent 1px)"
      },
      animation: {
        blink: "blink 1s steps(2, start) infinite",
        marquee: "marquee 32s linear infinite",
        "fade-up": "fade-up 0.7s ease forwards"
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
