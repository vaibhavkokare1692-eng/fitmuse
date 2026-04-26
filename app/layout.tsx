import type { Metadata } from "next";
import "@/app/globals.css";
import { brandName } from "@/data/mock-data";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: `${brandName} | Digital Styling Assistant`,
    template: `%s | ${brandName}`,
  },
  description:
    "An affordable digital stylist MVP for creators, influencers, students, and young professionals who need complete outfits fast.",
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
