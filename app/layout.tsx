import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./site.css";
import NavBar from "../components/NavBar";

export const metadata: Metadata = {
  title: "IDMRES — Integrated Disaster Monitoring & Emergency Response System",
  description:
    "Static showcase prototype: integrated flood and landslide risk assessment, decision support, and emergency response coordination for Sri Lanka.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#071016",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
