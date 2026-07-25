import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AdCrewOS — Autonomous ad ops for solo operators",
  description:
    "Your ads, on autopilot. AdCrewOS watches Google & Meta spend around the clock, kills the bleed before it costs you, and scales the winners on your say-so.",
  metadataBase: new URL(process.env.APP_URL || "https://adcrewos.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} h-full`}>
      <body className="min-h-full bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
