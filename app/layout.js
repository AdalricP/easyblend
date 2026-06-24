import "./globals.css";

export const metadata = {
  title: "BlendBox — one link to a fresh Spotify Blend",
  description:
    "Claim blendbox.xyz/yourname and drop in your Spotify Blend invites. Every visitor gets handed a fresh one.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
