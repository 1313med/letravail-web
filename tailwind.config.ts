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
        navy: {
          DEFAULT: "#06172F",
          800: "#071B35",
          700: "#0B2648",
          600: "#0F3058",
        },
        mint: {
          DEFAULT: "#37D6B5",
          glow: "#5EF2D6",
          dim: "#2AB89A",
        },
        slate: {
          text: "#D9E6F3",
          muted: "#91A4B7",
          dim: "#6B8299",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        glow: "0 0 60px rgba(55, 214, 181, 0.15)",
        "glow-lg": "0 0 100px rgba(55, 214, 181, 0.25)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
        card: "0 4px 24px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 12px 48px rgba(55, 214, 181, 0.12)",
      },
      animation: {
        aurora: "aurora 8s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "fade-up": "fadeUp 0.8s ease-out both",
        "fade-up-1": "fadeUp 0.8s ease-out 0.1s both",
        "fade-up-2": "fadeUp 0.8s ease-out 0.2s both",
        "fade-up-3": "fadeUp 0.8s ease-out 0.3s both",
        twinkle: "twinkle 4s ease-in-out infinite",
      },
      keyframes: {
        aurora: {
          "0%": { transform: "translateX(-10%) rotate(-2deg)", opacity: "0.4" },
          "100%": { transform: "translateX(10%) rotate(2deg)", opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
