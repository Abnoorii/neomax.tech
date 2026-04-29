import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0F",
        bg2: "#0F0F1A",
        surface: "#13131F",
        surface2: "#1A1A2E",
        accentBlue: "#4F6EF7",
        accentViolet: "#7C3AED",
        accentCyan: "#06B6D4",
        textSecondary: "#A1A1AA",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "neomax-gradient": "linear-gradient(90deg, #4F6EF7, #7C3AED)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,58,237,0.35), 0 8px 24px rgba(79,110,247,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
