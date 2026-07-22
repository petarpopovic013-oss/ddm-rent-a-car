"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitInquiryAction } from "@/app/public-actions";
import DateRangeCalendar, { formatInquiryDate } from "./date-range-calendar";
import styles from "./inquiry-modal.module.css";

export type InquiryVehicle = {
  slug: string;
  label: string;
  pricing: {
    minDays: number;
    maxDays: number | null;
    priceRsd: number;
    pricingMode: "daily" | "fixed";
  }[];
  unavailablePeriods: {
    pickupDate: string;
    returnDate: string;
  }[];
};

const initialState = { status: "idle" as const, message: "" };

function InquiryDialog({
  vehicles,
  initialVehicle,
  onClose,
}: {
  vehicles: InquiryVehicle[];
  initialVehicle: string;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(submitInquiryAction, initialState);
  const [step, setStep] = useState(initialVehicle ? 2 : 1);
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const vehicleOptions = [...vehicles, { slug: "other", label: "Drugo / potrebna preporuka", pricing: [], unavailablePeriods: [] }];
  const selectedVehicle = vehicleOptions.find((option) => option.slug === vehicle);
  const selectedVehicleLabel = selectedVehicle?.label;
  const start = pickupDate ? new Date(`${pickupDate}T12:00:00Z`) : null;
  const end = returnDate ? new Date(`${returnDate}T12:00:00Z`) : null;
  const rentalDays = start && end
    ? Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
    : 0;
  const selectedTier = selectedVehicle?.pricing.find(
    (tier) => rentalDays >= tier.minDays && (tier.maxDays == null || rentalDays <= tier.maxDays),
  );
  const estimatedTotal = selectedTier
    ? selectedTier.pricingMode === "fixed"
      ? selectedTier.priceRsd
      : rentalDays * selectedTier.priceRsd
    : null;
  const formatRsd = (amount: number) => `${new Intl.NumberFormat("sr-RS").format(amount)} RSD`;
  const stepCopy = [
    {
      title: "Izaberite vozilo.",
      copy: "Izaberite model ili označite da želite preporuku.",
    },
    {
      title: "Izaberite termin.",
      copy: "Unesite datum preuzimanja i vraćanja.",
    },
    {
      title: "Unesite kontakt.",
      copy: "Ostavite podatke na koje možemo da odgovorimo.",
    },
    {
      title: "Proverite podatke.",
      copy: "Pregledajte vozilo, termin, kontakt i iznos pre slanja.",
    },
  ][step - 1]!;

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  return (
    <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
      <button className={styles.backdrop} type="button" onClick={onClose} aria-label="Zatvori upit" />
      <div className={styles.panel}>
        <div className={styles.aside}>
          <span>DDM / KORAK 0{step}</span>
          <strong>{stepCopy.title}</strong>
          <p>{stepCopy.copy}</p>
          {["Izaberite vozilo", "Unesite termin", "Kontakt podaci", "Potvrda upita"].map((label, index) => (
            <div className={step === index + 1 ? styles.asideStepActive : step > index + 1 ? styles.asideStepDone : ""} key={label}>
              <b>0{index + 1}</b> {label}
            </div>
          ))}
        </div>
        <div className={styles.content}>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Zatvori">×</button>
          {state.status === "success" ? (
            <div className={styles.success} aria-live="polite">
              <span>Upit je primljen</span>
              <h2 id="inquiry-title">Hvala na poverenju.</h2>
              <p>{state.message}</p>
              <button className="button" type="button" onClick={onClose}>Nazad na sajt <span>↗</span></button>
            </div>
          ) : (
            <form action={action} className={styles.wizardForm} ref={formRef}>
              <input type="hidden" name="vehicle_slug" value={vehicle} />
              <input type="hidden" name="pickup_date" value={pickupDate} />
              <input type="hidden" name="return_date" value={returnDate} />
              <input type="hidden" name="customer_name" value={customerName} />
              <input type="hidden" name="customer_phone" value={customerPhone} />
              <input type="hidden" name="customer_email" value={customerEmail} />
              <input type="hidden" name="customer_note" value={customerNote} />
              <input type="hidden" name="privacy" value={privacyAccepted ? "on" : ""} />
              <input type="hidden" name="website" value="" />
              <div className={styles.progress} aria-label={`Korak ${step} od 4`}>
                {[1, 2, 3, 4].map((item) => <span className={item <= step ? styles.progressActive : ""} key={item} />)}
                <b>0{step} / 04</b>
              </div>

              {step === 1 && (
                <section className={styles.step}>
                  <p className="eyebrow">Korak 01 · Vozilo</p>
                  <h2 id="inquiry-title" ref={stepHeadingRef} tabIndex={-1}>Koje vozilo želite?</h2>
                  <p className={styles.intro}>Izaberite konkretan model ili označite da želite našu preporuku.</p>
                  <div className={styles.vehicleOptions}>
                    {vehicleOptions.map((option, index) => (
                      <button
                        className={vehicle === option.slug ? styles.vehicleOptionActive : ""}
                        type="button"
                        key={option.slug}
                        onClick={() => setVehicle(option.slug)}
                        aria-pressed={vehicle === option.slug}
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{option.label}</strong>
                        <b>{vehicle === option.slug ? "Izabrano" : "Izaberi"} ↗</b>
                      </button>
                    ))}
                  </div>
                  <div className={styles.stepActions}>
                    <span>Izaberite jednu opciju</span>
                    <button className="button" type="button" disabled={!vehicle} onClick={() => setStep(2)}>Nastavi na termin <b>→</b></button>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className={styles.step}>
                  <p className="eyebrow">Korak 02 · Termin</p>
                  <h2 id="inquiry-title" ref={stepHeadingRef} tabIndex={-1}>Kada vam treba vozilo?</h2>
                  <p className={styles.intro}>Izaberite preuzimanje, a zatim vraćanje. Najam može trajati najviše 30 dana.</p>
                  <DateRangeCalendar
                    pickupDate={pickupDate}
                    returnDate={returnDate}
                    unavailablePeriods={selectedVehicle?.unavailablePeriods ?? []}
                    onChange={(pickup, returning) => { setPickupDate(pickup); setReturnDate(returning); }}
                  />
                  <div className={styles.stepActions}>
                    <button className={styles.backButton} type="button" onClick={() => setStep(1)}>← Nazad</button>
                    <button className="button" type="button" disabled={!pickupDate || !returnDate} onClick={() => setStep(3)}>Nastavi na kontakt <b>→</b></button>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className={styles.step}>
                  <p className="eyebrow">Korak 03 · Kontakt</p>
                  <h2 id="inquiry-title" ref={stepHeadingRef} tabIndex={-1}>Kontakt podaci</h2>
                  <div className={styles.summary}>
                    <div><span>Vozilo</span><strong>{selectedVehicleLabel}</strong></div>
                    <div><span>Preuzimanje</span><strong>{formatInquiryDate(pickupDate)}</strong></div>
                    <div><span>Vraćanje</span><strong>{formatInquiryDate(returnDate)}</strong></div>
                  </div>
                  <div className={styles.form}>
                    <label><span>Ime i prezime *</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} autoComplete="name" required minLength={2} /></label>
                    <label><span>Telefon *</span><input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} type="tel" autoComplete="tel" required minLength={6} /></label>
                    <label className={styles.wide}><span>Email *</span><input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} type="email" autoComplete="email" required /></label>
                    <label className={styles.wide}><span>Napomena</span><textarea value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} rows={3} placeholder="Broj putnika, putovanje u inostranstvo ili druga važna informacija" /></label>
                    <label className={`${styles.consent} ${styles.wide}`}>
                      <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} required />
                      <span>Saglasan/na sam da DDM koristi ove podatke kako bi odgovorio na upit i prihvatam uslove najma.</span>
                    </label>
                    {state.status === "error" && <p className={`${styles.error} ${styles.wide}`} role="alert">{state.message}</p>}
                  </div>
                  <div className={styles.stepActions}>
                    <button className={styles.backButton} type="button" onClick={() => setStep(2)}>← Nazad</button>
                    <button className="button" type="button" onClick={() => { if (formRef.current?.reportValidity()) setStep(4); }}>Pregledaj upit <b>→</b></button>
                  </div>
                </section>
              )}

              {step === 4 && (
                <section className={styles.step}>
                  <p className="eyebrow">Korak 04 · Potvrda</p>
                  <h2 id="inquiry-title" ref={stepHeadingRef} tabIndex={-1}>Pregled upita</h2>
                  <p className={styles.intro}>Proverite podatke pre slanja.</p>
                  <div className={styles.confirmationGrid}>
                    <div><span>Vozilo</span><strong>{selectedVehicleLabel}</strong></div>
                    <div><span>Period</span><strong>{formatInquiryDate(pickupDate)} do {formatInquiryDate(returnDate)}</strong></div>
                    <div><span>Broj dana</span><strong>{rentalDays}</strong></div>
                    <div><span>Kontakt</span><strong>{customerName}<small>{customerPhone} · {customerEmail}</small></strong></div>
                  </div>
                  <div className={styles.priceConfirmation}>
                    <div>
                      <span>Obračun cene</span>
                      {selectedTier ? (
                        <p>{selectedTier.pricingMode === "fixed" ? "Fiksna cena za 30 dana" : `${rentalDays} dana × ${formatRsd(selectedTier.priceRsd)}`}</p>
                      ) : (
                        <p>Cenu potvrđuje DDM tim nakon provere vozila.</p>
                      )}
                    </div>
                    <div>
                      <span>Ukupno</span>
                      <strong>{estimatedTotal != null ? formatRsd(estimatedTotal) : "Na upit"}</strong>
                    </div>
                  </div>
                  {customerNote && <div className={styles.confirmationNote}><span>Napomena</span><p>{customerNote}</p></div>}
                  {state.status === "error" && <p className={styles.error} role="alert">{state.message}</p>}
                  <div className={styles.stepActions}>
                    <button className={styles.backButton} type="button" onClick={() => setStep(3)}>← Izmeni podatke</button>
                    <button className="button" type="submit" disabled={pending}>{pending ? "Slanje..." : "Potvrdi i pošalji"} <b>↗</b></button>
                  </div>
                </section>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InquiryModal({ vehicles }: { vehicles: InquiryVehicle[] }) {
  const [open, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const trigger = (event.target as HTMLElement).closest<HTMLElement>("[data-inquiry-trigger]");
      if (!trigger) return;
      event.preventDefault();
      setSelectedVehicle(trigger.dataset.vehicleSlug ?? "");
      setOpen(true);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return open ? <InquiryDialog vehicles={vehicles} initialVehicle={selectedVehicle} onClose={() => setOpen(false)} /> : null;
}
