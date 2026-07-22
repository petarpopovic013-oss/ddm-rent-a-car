import Image from "next/image";
import Link from "next/link";
import AdminNav from "./admin-nav";
import { logoutAction } from "../actions";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand" aria-label="DDM Rent a Car admin">
          <Image src="/Logo/DDM-RC.png" width={172} height={78} alt="DDM Rent a Car" priority />
          <span>Control room</span>
        </Link>
        <AdminNav />
        <div className="admin-sidebar__footer">
          <p>DDM Rent a Car</p>
          <a href="/" target="_blank">Otvori javni sajt ↗</a>
          <form action={logoutAction}>
            <button type="submit">Odjavi se</button>
          </form>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-mobile-header">
          <Link href="/admin"><Image src="/Logo/DDM-RC.png" width={126} height={56} alt="DDM" /></Link>
          <span>Admin panel</span>
        </header>
        {children}
      </div>
    </div>
  );
}
