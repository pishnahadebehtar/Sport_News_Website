// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

// Load Far_Nazanin from public/font
const farNazanin = localFont({
  src: [
    {
      path: "./Far_Nazanin.ttf", // Correct path: public/font/Far_Nazanin.ttf
      weight: "400",
      style: "normal",
    },
    // Add more variants if available (e.g., bold)
  ],
  variable: "--font-far-nazanin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "هد هد صبا",
  description: "پایگاه اطلاع رسانی مطالب ورشی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${farNazanin.variable} antialiased`}>{children}</body>
    </html>
  );
}
