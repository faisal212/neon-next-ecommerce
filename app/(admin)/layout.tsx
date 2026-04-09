import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./admin-globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "PK Admin",
    template: "%s | PK Admin",
  },
  description: "E-Commerce Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
