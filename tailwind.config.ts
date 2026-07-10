import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F5EEE4",
        beige: "#EDE2D0",
        mocha: "#6B5240",
        taupe: "#9C8A76",
        charcoal: "#2B2622",
        olive: "#8A8B6C",
        rose: "#C79E93",
        burgundy: "#5C1A1F",
        line: "rgba(43,38,34,0.14)",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-jost)", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
