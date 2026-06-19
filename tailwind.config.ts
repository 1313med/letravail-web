import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f6f8fb",
        foreground: "#0b1220",
        primary: {
          DEFAULT: "#0c4a5e",
          dark: "#083344",
          light: "#0e7490",
        },
        accent: {
          DEFAULT: "#14b8a6",
          light: "#5eead4",
        },
        gold: {
          DEFAULT: "#c9a227",
          light: "#e8c96a",
        },
        muted: {
          DEFAULT: "#64748b",
          light: "#94a3b8",
        },
        border: {
          DEFAULT: "#e2e8f0",
          light: "#f1f5f9",
        },
        card: "#ffffff",
        surface: "#f8fafc",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(11, 18, 32, 0.04), 0 4px 16px rgba(11, 18, 32, 0.06)",
        "card-hover":
          "0 4px 12px rgba(11, 18, 32, 0.06), 0 12px 40px rgba(20, 184, 166, 0.1)",
        glass: "0 8px 32px rgba(11, 18, 32, 0.08)",
        glow: "0 0 40px rgba(20, 184, 166, 0.15)",
        accent: "0 4px 14px rgba(20, 184, 166, 0.25)",
        "accent-lg": "0 8px 24px rgba(20, 184, 166, 0.35)",
        gold: "0 4px 14px rgba(201, 162, 39, 0.2)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
