import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        paper: "#fafaf7",
        accent: { DEFAULT: "#f59e0b", deep: "#d97706" },
        line: "#1e1e1e",
      },
      fontFamily: { sans: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
