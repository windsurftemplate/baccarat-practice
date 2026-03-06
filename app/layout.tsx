import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baccarat Practice — Corporation Banker",
  description: "Practice baccarat with Gold 7, Jade 8, Small Ruby and Big Ruby side bets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
