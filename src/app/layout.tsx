import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "The Market Witness — Your Trades Will Be Judged",
  description: "Ace Attorney meets DeFi. Upload your trade and watch it get roasted in a pixel-art courtroom powered by Pyth oracle data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} antialiased scanlines`}>
        {children}
      </body>
    </html>
  );
}
