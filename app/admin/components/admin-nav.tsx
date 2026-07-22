"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Pregled", index: "01" },
  { href: "/admin/vozila", label: "Vozila", index: "02" },
  { href: "/admin/rezervacije", label: "Rezervacije", index: "03" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="Admin navigacija">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={active ? "admin-nav__link admin-nav__link--active" : "admin-nav__link"}>
            <span>{item.index}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
