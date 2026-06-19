import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Clinical Agent Harness",
  description: "Scaffold shell for the Clinical Agent Harness Experiment"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
