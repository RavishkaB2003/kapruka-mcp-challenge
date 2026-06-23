import type { Metadata } from "next";
import { Inter, Outfit, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["500", "600", "700"],
});

const sinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala", "latin"],
  variable: "--font-sinhala",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Kapruka Gifting Agent — Conversational Shopping",
  description: "A premium split-screen e-commerce experience powered by conversational AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${sinhala.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
