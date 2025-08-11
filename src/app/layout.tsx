import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Informative Times - Newspaper",
  description: "The Pulse of Today's World - A comprehensive news platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="App">
        {children}
      </body>
    </html>
  );
}
