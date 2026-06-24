import "./globals.css";
import { Fraunces, Space_Mono } from "next/font/google";
import Doodles from "./_components/Doodles";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "easyblend — one link to a fresh Spotify Blend",
  description:
    "Claim easyblend.xyz/yourname, drop in your Spotify Blend invites, share one link. Every visitor gets handed a fresh one.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <Doodles />
        {children}
      </body>
    </html>
  );
}
