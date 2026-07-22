import { requireAdmin } from "@/lib/admin/session";
import AdminShell from "../components/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
