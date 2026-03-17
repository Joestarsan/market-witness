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
      <head>
        <link rel="preload" as="image" href="/characters/chop-v2.png" />
        <link rel="preload" as="image" href="/characters/planck-v2.png" />
        <link rel="preload" as="image" href="/characters/pirb-v3.png" />
        <link rel="preload" as="image" href="/characters/chop-react.png" />
        <link rel="preload" as="image" href="/characters/planck-react.png" />
        <link rel="preload" as="image" href="/characters/chop-happy.png" />
        <link rel="preload" as="image" href="/characters/chop-sad.png" />
        <link rel="preload" as="image" href="/characters/planck-happy.png" />
        <link rel="preload" as="image" href="/characters/planck-sad.png" />
      </head>
      <body className={`${pixelFont.variable} antialiased scanlines`}>
        {children}
      </body>
    </html>
  );
}
