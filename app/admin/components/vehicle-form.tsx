import Image from "next/image";
import Link from "next/link";
import type { PricingTier, Vehicle } from "@/lib/admin/types";
import { bodyTypeLabels } from "@/lib/admin/types";
import { vehicleImageUrl } from "@/lib/admin/data";
import { SubmitButton } from "./form-controls";

function tierPrice(tiers: PricingTier[] | undefined, minDays: number) {
  return tiers?.find((tier) => tier.min_days === minDays)?.price_rsd ?? "";
}

export default function VehicleForm({
  action,
  vehicle,
}: {
  action: (formData: FormData) => void | Promise<void>;
  vehicle?: Vehicle | null;
}) {
  const imageUrl = vehicleImageUrl(vehicle?.primary_image_path);
  const gallery = [...(vehicle?.rc_vehicle_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return (
    <form action={action} className="admin-editor">
      <section className="admin-form-section">
        <div className="admin-form-section__intro"><span>01</span><div><h2>Osnovni podaci</h2><p>Identitet vozila i javni opis ponude.</p></div></div>
        <div className="admin-form-grid">
          <label><span>Marka *</span><input name="make" defaultValue={vehicle?.make} required maxLength={80} placeholder="Volkswagen" /></label>
          <label><span>Model *</span><input name="model" defaultValue={vehicle?.model} required maxLength={80} placeholder="Golf 7" /></label>
          <label><span>Godište</span><input name="year" type="number" min="1990" max="2100" defaultValue={vehicle?.year ?? ""} placeholder="2018" /></label>
          <label><span>Kategorija *</span><input name="category" defaultValue={vehicle?.category} required placeholder="Kompaktna klasa" /></label>
          <label><span>Tip karoserije *</span><select name="body_type" defaultValue={vehicle?.body_type ?? "hatchback"}>{Object.entries(bodyTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label className="admin-field--full"><span>Opis</span><textarea name="description" rows={5} defaultValue={vehicle?.description ?? ""} placeholder="Kratak i konkretan opis vozila…" /></label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-section__intro"><span>02</span><div><h2>Specifikacije</h2><p>Podaci koji se prikazuju uz vozilo i koriste u filterima.</p></div></div>
        <div className="admin-form-grid admin-form-grid--specs">
          <label><span>Motor *</span><input name="engine" defaultValue={vehicle?.engine} required placeholder="1.6" /></label>
          <label><span>Gorivo *</span><select name="fuel_type" defaultValue={vehicle?.fuel_type ?? "diesel"}><option value="petrol">Benzin</option><option value="diesel">Dizel</option><option value="hybrid">Hibrid</option><option value="electric">Električni</option><option value="lpg">LPG</option></select></label>
          <label><span>Menjač *</span><select name="transmission" defaultValue={vehicle?.transmission ?? "manual"}><option value="manual">Manuelni</option><option value="automatic">Automatski</option></select></label>
          <label><span>Sedišta *</span><input name="seats" type="number" min="1" max="20" defaultValue={vehicle?.seats ?? 5} required /></label>
          <label><span>Vrata</span><input name="doors" type="number" min="1" max="10" defaultValue={vehicle?.doors ?? ""} /></label>
          <label className="admin-check"><input name="air_conditioning" type="checkbox" defaultChecked={vehicle?.air_conditioning ?? true} /><span>Klima</span></label>
          <label className="admin-check"><input name="cruise_control" type="checkbox" defaultChecked={vehicle?.cruise_control ?? false} /><span>Tempomat</span></label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-section__intro"><span>03</span><div><h2>Cenovnik</h2><p>Dnevne cene i fiksna cena za kompletnih 30 dana.</p></div></div>
        <div className="admin-pricing-grid">
          <label><span>1–3 dana</span><div><input name="price_1_3" type="number" min="1" defaultValue={tierPrice(vehicle?.rc_vehicle_pricing_tiers, 1)} required /><b>RSD / dan</b></div></label>
          <label><span>4–10 dana</span><div><input name="price_4_10" type="number" min="1" defaultValue={tierPrice(vehicle?.rc_vehicle_pricing_tiers, 4)} required /><b>RSD / dan</b></div></label>
          <label><span>11–29 dana</span><div><input name="price_11_29" type="number" min="1" defaultValue={tierPrice(vehicle?.rc_vehicle_pricing_tiers, 11)} required /><b>RSD / dan</b></div></label>
          <label className="admin-pricing-grid__monthly"><span>30 dana</span><div><input name="price_30" type="number" min="1" defaultValue={tierPrice(vehicle?.rc_vehicle_pricing_tiers, 30)} required /><b>RSD fiksno</b></div></label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-section__intro"><span>04</span><div><h2>Slika i objava</h2><p>Vizuelni prikaz, redosled i status na sajtu.</p></div></div>
        <div className="admin-media-grid">
          <div className="admin-image-field">
            {imageUrl ? <div className="admin-image-preview"><Image src={imageUrl} alt={`${vehicle?.make} ${vehicle?.model}`} fill sizes="420px" /></div> : <div className="admin-image-placeholder">DDM / fotografija vozila</div>}
            <label><span>{vehicle ? "Zameni fotografiju" : "Glavna fotografija *"}</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" required={!vehicle} /></label>
            <p className="admin-image-hint">Slika se automatski smanjuje i pretvara u WebP.</p>
          </div>
          <div className="admin-form-grid">
            <label><span>Status *</span><select name="status" defaultValue={vehicle?.status ?? "hidden"}><option value="hidden">Sakriveno</option><option value="active">Aktivno</option><option value="service">Servis</option><option value="archived">Arhivirano</option></select></label>
            <label><span>Redosled</span><input name="sort_order" type="number" min="0" defaultValue={vehicle?.sort_order ?? 0} /></label>
            <label className="admin-check"><input name="featured" type="checkbox" defaultChecked={vehicle?.featured ?? false} /><span>Izdvojeno vozilo</span></label>
          </div>
        </div>
        <div className="admin-gallery-field">
          <label>
            <span>Ostale fotografije</span>
            <input name="gallery_images" type="file" accept="image/jpeg,image/png,image/webp" multiple />
          </label>
          <p>Možete izabrati više slika odjednom. Do 20 fotografija po čuvanju, ukupno najviše 50 MB pre kompresije.</p>
          {gallery.length > 0 && (
            <div className="admin-gallery-grid">
              {gallery.map((galleryImage, index) => {
                const url = vehicleImageUrl(galleryImage.storage_path);
                return (
                  <label className="admin-gallery-item" key={galleryImage.id}>
                    {url && <Image src={url} alt={`${vehicle?.make} ${vehicle?.model} — ${index + 2}`} fill sizes="180px" />}
                    <span><input type="checkbox" name="remove_gallery_image" value={galleryImage.id} /> Ukloni</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="admin-editor__actions">
        <Link href="/admin/vozila" className="admin-button admin-button--ghost">Otkaži</Link>
        <SubmitButton>{vehicle ? "Sačuvaj izmene" : "Dodaj vozilo"}</SubmitButton>
      </div>
    </form>
  );
}
