import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin panel | DDM Rent a Car",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
