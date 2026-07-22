import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin/session";
import { loginAction } from "../actions";
import { SubmitButton } from "../components/form-controls";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  try {
    if (await hasAdminSession()) redirect("/admin");
  } catch {
    // Configuration errors are shown after submitting the form.
  }
  const { error } = await searchParams;
  return (
    <main className="admin-login">
      <div className="admin-login__grid" aria-hidden="true" />
      <section className="admin-login__panel">
        <div className="admin-login__brand">
          <Image src="/Logo/DDM-RC.png" width={190} height={86} alt="DDM Rent a Car" priority />
          <span>Control room / Novi Sad</span>
        </div>
        <div className="admin-login__copy">
          <p className="admin-eyebrow">Zaštićen pristup</p>
          <h1>Dobrodošli nazad.</h1>
          <p>Upravljanje flotom, cenama i rezervacijama na jednom mestu.</p>
        </div>
        {error ? <div className="admin-message admin-message--error">{error}</div> : null}
        <form action={loginAction} className="admin-login__form">
          <label><span>Administratorska šifra</span><input name="password" type="password" autoComplete="current-password" required autoFocus /></label>
          <SubmitButton>Prijavi se <span>↗</span></SubmitButton>
        </form>
        <Link href="/">← Nazad na javni sajt</Link>
      </section>
      <aside className="admin-login__aside">
        <span>DDM / 01</span>
        <strong>Flota pod kontrolom.</strong>
        <p>Brže obradite upite, sačuvajte tačne cene i pratite svaki termin.</p>
      </aside>
    </main>
  );
}
