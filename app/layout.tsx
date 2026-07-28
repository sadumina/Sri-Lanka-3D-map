import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sri Lanka 3D Hazard Map",
  description: "Cinematic 3D flood and landslide prediction visualization for Sri Lanka.",
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
