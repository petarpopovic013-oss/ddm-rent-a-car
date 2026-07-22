import type { Metadata } from "next";
import { Barlow_Semi_Condensed, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Barlow_Semi_Condensed({
  subsets: ["latin-ext"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin-ext"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rentacarddm.rs"),
  title: "DDM Rent a Car Novi Sad | Pouzdano iznajmljivanje vozila",
  description:
    "DDM Rent a Car Novi Sad. Pouzdana vozila, neograničena kilometraža i direktan dogovor. Izaberite vozilo i pošaljite online upit.",
  keywords: ["rent a car Novi Sad", "iznajmljivanje automobila Novi Sad", "DDM rent a car"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: "/",
    siteName: "DDM Rent a Car",
    title: "DDM Rent a Car Novi Sad",
    description: "Pouzdana vozila, direktan dogovor i jednostavan najam u Novom Sadu.",
    images: [{ url: "/Logo/DDM-RC.png", width: 946, height: 392, alt: "DDM Rent a Car Novi Sad" }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr-Latn" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
