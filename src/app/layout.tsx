import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book.am - Booking Platform for Barbers & Salons",
  description: "Book appointments at barbers and salons in Armenia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
