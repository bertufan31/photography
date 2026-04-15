import type { Metadata } from "next";
import { Kalnia } from "next/font/google";
import "./globals.css";

const kalnia = Kalnia({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kalnia",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Photography Portfolio",
  description: "A photography portfolio website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kalnia.variable} antialiased`}>
      <body className="bg-[#0a0a0a]">{children}</body>
    </html>
  );
}
