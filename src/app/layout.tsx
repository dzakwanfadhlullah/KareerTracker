import type { Metadata } from "next";
import { Inter, Libre_Baskerville, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const libre = Libre_Baskerville({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-serif", display: "swap" });
const mono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "KareerTrack — Track Lamaran Kerja dari Saved sampai Offering",
  description: "Workspace tracking apply kerja dari MagangKareer untuk mencatat lowongan, status, interview, dan follow-up.",
  openGraph: {
    title: "KareerTrack by MagangKareer",
    description: "Track semua lamaran kerja dari saved sampai offering.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" className={`${inter.variable} ${libre.variable} ${mono.variable}`}><body>{children}</body></html>;
}
