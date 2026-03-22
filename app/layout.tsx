import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thinking Visualizer",
  description: "Convert any question into a structured reasoning graph powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
