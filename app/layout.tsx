import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEOMAX Growth Engine",
  description: "Global marketing, sales, and e-commerce growth agency.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
