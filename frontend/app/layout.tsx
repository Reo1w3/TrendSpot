import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrendSpot — AI Dropshipping Product Research",
  description: "Find viral winning products using real-time insights.",
  generator: 'TrendSpot',
  icons: {
    icon: '/icon.svg?v=1', // Forzado estático para que use siempre tu logo favorito
  },
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}