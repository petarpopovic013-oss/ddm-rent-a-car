import { getDictionary } from "@/lib/i18n/translations";

export default function VehicleLoading() {
  const dictionary = getDictionary("sr");
  return (
    <main className="vehicle-loading">
      <div className="page-shell">{dictionary["vehicle.detail.loading"]}</div>
    </main>
  );
}
