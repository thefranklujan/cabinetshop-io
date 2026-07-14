import "./globals.css";
import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

// Rollout step 1 (docs/design-spec.md §2, §9): self-hosted fonts via next/font.
// Archivo = display/headings, IBM Plex Sans = body/UI, IBM Plex Mono = data
// (job numbers, SKUs, money, stage ages). display:swap keeps text visible during
// load; only the weights/subsets the design system uses are requested.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-archivo",
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-sans",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "CabinetShop.io — Operating System for Custom Cabinet Shops",
  description: "Run your entire cabinet shop from one live board.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
