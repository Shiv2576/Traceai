import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        void: "#050508",
        surface: "#0d0d14",
        panel: "#13131e",
        border: "#1e1e2e",
        accent: "#7c6af7",
        "accent-bright": "#a599ff",
        signal: "#2de2a0",
        warn: "#f7a84a",
        muted: "#4a4a6a",
        text: "#e2e2f0",
        "text-dim": "#7a7a9a",
      },
    },
  },
  plugins: [],
};
export default config;
