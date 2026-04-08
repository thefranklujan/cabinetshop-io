import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CabinetShop.io — Operating System for Custom Cabinet Shops",
  description: "Run your entire cabinet shop from one live board.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
