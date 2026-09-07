import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reedroom — Instruments with a story",
  description: "An interactive concept for a musician-first sample library. Discover rare sounds and explore artist royalties.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
