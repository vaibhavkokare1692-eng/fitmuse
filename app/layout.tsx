import type { Metadata } from "next";
import "@/app/globals.css";
import { brandName } from "@/data/mock-data";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: `${brandName} | Outfit-Board Stylist`,
    template: `%s | ${brandName}`,
  },
  description:
    "Build complete outfits that fit your budget, style, stores, and life without uploading your full closet first.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
