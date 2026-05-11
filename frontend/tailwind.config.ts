import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#6B1C1C",
          dark: "#4A1010",
          darker: "#3D0E0E",
          light: "#8B2E2E",
        },
        gold: {
          DEFAULT: "#D4A857",
          light: "#E8C278",
          muted: "#B8904A",
        },
        white: "#FFFFFF",
        "off-white": "#FAF8F5",
        cream: "#F5F0E8",
        gray: {
          100: "#F4F4F4",
          200: "#E8E8E8",
          400: "#9CA3AF",
          600: "#4B5563",
          800: "#1F2937",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Nunito Sans", "sans-serif"],
      },
      fontSize: {
        // Heading sizes
        "heading-1": ["3.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-2": ["2.5rem", { lineHeight: "1.3", fontWeight: "700" }],
        "heading-3": ["2rem", { lineHeight: "1.3", fontWeight: "700" }],
        "heading-4": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-5": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 16px rgba(0, 0, 0, 0.12)",
        maroon: "0 0 20px rgba(107, 28, 28, 0.2)",
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        fadeInUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideDown: {
          from: {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
