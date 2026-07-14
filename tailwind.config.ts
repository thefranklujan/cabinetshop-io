import type { Config } from "tailwindcss";

// Rollout step 1 (docs/design-spec.md): tokens mapped into Tailwind so later steps
// build against the design system. Font families read the next/font CSS variables set
// on <html> in layout.tsx. Tailwind's default spacing scale already matches the
// approved 4/8/12/16/24/32/48/64 steps (p-1..p-16), so it is left intact.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core palette
        ink: "#0a0a0a",
        paper: "#fafaf7",
        amber: { DEFAULT: "#f59e0b", bright: "#fbbf24", deep: "#d97706" },
        accent: { DEFAULT: "#f59e0b", deep: "#d97706" }, // retained: existing usages
        // Derived neutrals
        surface: { DEFAULT: "#111111", 2: "#161616" },
        line: { DEFAULT: "#1e1e1e", strong: "#262626" },
        muted: "#737373",
        body: "#d4d4d4",
        // Semantic status (state only)
        ok: "#34d399",
        warn: "#f59e0b",
        danger: "#f87171",
        info: "#60a5fa",
        external: "#fb923c",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "Archivo", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-plex-sans)", "IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        // Available as tokens; existing component radii are retuned in later steps.
        token: "12px",
        "token-sm": "8px",
        "token-lg": "16px",
      },
    },
  },
  plugins: [],
};
export default config;
