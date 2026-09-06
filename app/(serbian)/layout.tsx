import type { Metadata } from "next";
import { fontClasses } from "@/app/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rentacarddm.rs"),
};

export default function SerbianRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr-Latn" className={fontClasses("sr")}>
      <body>{children}</body>
    </html>
  );
}
