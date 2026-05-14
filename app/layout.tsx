import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";
import { brandName, headerTagline } from "@/data/mock-data";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: `${brandName} | ${headerTagline}`,
    template: `%s | ${brandName}`,
  },
  description:
    "Turn a style brief into complete outfit boards without uploading your full closet first.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
