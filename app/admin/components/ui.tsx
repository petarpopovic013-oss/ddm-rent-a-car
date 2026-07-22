import Link from "next/link";
import type { ReservationStatus, VehicleStatus } from "@/lib/admin/types";
import { reservationStatusLabels, vehicleStatusLabels } from "@/lib/admin/types";

export function PageHeader({ eyebrow, title, copy, actionHref, actionLabel }: {
  eyebrow: string;
  title: string;
  copy: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="admin-page-header">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {actionHref && actionLabel ? <Link href={actionHref} className="admin-button">{actionLabel} <span>↗</span></Link> : null}
    </div>
  );
}

export function MessageBanner({ success, error }: { success?: string; error?: string }) {
  const message = error ?? success;
  if (!message) return null;
  return <div className={error ? "admin-message admin-message--error" : "admin-message admin-message--success"}>{message}</div>;
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return <span className={`admin-status admin-status--${status}`}>{vehicleStatusLabels[status]}</span>;
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return <span className={`admin-status admin-status--${status}`}>{reservationStatusLabels[status]}</span>;
}
