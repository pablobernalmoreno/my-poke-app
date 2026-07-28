import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Poke App",
  description: "A Next.js app with a custom carousel",
};

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
