import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visa AI Assistant",
  description: "Next.js frontend for the Visa AI Assistant project.",
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
