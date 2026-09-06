"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitInquiryAction } from "@/app/public-actions";
import type { Locale } from "@/lib/i18n/config";
import { localeConfig } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/translations";
import { formatMessage } from "@/lib/i18n/translations";
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
const DAILY_RENTAL_MAX_DAYS = 25;
const MONTHLY_RENTAL_MIN_DAYS = 26;
const MAX_RENTAL_DAYS = 31;

function InquiryDialog({
  vehicles,
  initialVehicle,
  onClose,
  locale,
  dictionary,
}: {
  vehicles: InquiryVehicle[];
  initialVehicle: string;
  onClose: () => void;
  locale: Locale;
  dictionary: Dictionary;
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
  const vehicleOptions = [...vehicles, { slug: "other", label: dictionary["inquiry.otherVehicle"], pricing: [], unavailablePeriods: [] }];
  const selectedVehicle = vehicleOptions.find((option) => option.slug === vehicle);
  const selectedVehicleLabel = selectedVehicle?.label;
  const hasMonthlyPrice = selectedVehicle?.pricing.some(
    (tier) => tier.pricingMode === "fixed",
  ) ?? false;
  const maxRentalDays: 25 | 31 = vehicle === "other" || hasMonthlyPrice
    ? MAX_RENTAL_DAYS
    : DAILY_RENTAL_MAX_DAYS;
  const start = pickupDate ? new Date(`${pickupDate}T12:00:00Z`) : null;
  const end = returnDate ? new Date(`${returnDate}T12:00:00Z`) : null;
  const rentalDays = start && end
    ? Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
    : 0;
  const selectedTier = selectedVehicle?.pricing.find((tier) => {
    if (
      rentalDays >= MONTHLY_RENTAL_MIN_DAYS
      && rentalDays <= MAX_RENTAL_DAYS
    ) {
      return tier.pricingMode === "fixed";
    }
    return rentalDays > 0
      && rentalDays <= DAILY_RENTAL_MAX_DAYS
      && tier.pricingMode === "daily"
      && rentalDays >= tier.minDays
      && (tier.maxDays == null || rentalDays <= tier.maxDays);
  });
  const estimatedTotal = selectedTier
    ? selectedTier.pricingMode === "fixed"
      ? selectedTier.priceRsd
      : rentalDays * selectedTier.priceRsd
    : null;
  const formatRsd = (amount: number) => `${new Intl.NumberFormat(localeConfig[locale].intlLocale).format(amount)} RSD`;
  const stepCopy = [
    {
      title: dictionary["inquiry.step1Title"],
      copy: dictionary["inquiry.step1Copy"],
    },
    {
      title: dictionary["inquiry.step2Title"],
      copy: dictionary["inquiry.step2Copy"],
    },
    {
      title: dictionary["inquiry.step3Title"],
      copy: dictionary["inquiry.step3Copy"],
    },
    {
      title: dictionary["inquiry.step4Title"],
      copy: dictionary["inquiry.step4Copy"],
    },
  ][step - 1]!;

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  return (
    <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
      <button className={styles.backdrop} type="button" onClick={onClose} aria-label={dictionary["inquiry.close"]} />
      <div className={styles.panel}>
        <div className={styles.aside}>
          <span>DDM / {dictionary["inquiry.step"]} 0{step}</span>
          <strong>{stepCopy.title}</strong>
          <p>{stepCopy.copy}</p>
          {[
            dictionary["inquiry.aside1"],
            dictionary["inquiry.aside2"],
            dictionary["inquiry.aside3"],
            dictionary["inquiry.aside4"],
          ].map((label, index) => (
            <div className={step === index + 1 ? styles.asideStepActive : step > index + 1 ? styles.asideStepDone : ""} key={label}>
              <b>0{index + 1}</b> {label}
            </div>
          ))}
        </div>
        <div className={styles.content}>
          <button className={styles.close} type="button" onClick={onClose} aria-label={dictionary["header.closeMenu"]}>×</button>
          {state.status === "success" ? (
            <div className={styles.success} aria-live="polite">
              <span>{dictionary["inquiry.received"]}</span>
              <h2 id="inquiry-title">{dictionary["inquiry.thanks"]}</h2>
              <p>{state.message}</p>
              <button className="button" type="button" onClick={onClose}>{dictionary["inquiry.backSite"]} <span>↗</span></button>
            </div>
          ) : (
            <form action={action} className={styles.wizardForm} ref={formRef}>
              <input type="hidden" name="vehicle_slug" value={vehicle} />
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="pickup_date" value={pickupDate} />
              <input type="hidden" name="return_date" value={returnDate} />
              <input type="hidden" name="customer_name" value={customerName} />
              <input type="hidden" name="customer_phone" value={customerPhone} />
              <input type="hidden" name="customer_email" value={customerEmail} />
              <input type="hidden" name="customer_note" value={customerNote} />
              <input type="hidden" name="privacy" value={privacyAccepted ? "on" : ""} />
              <input type="hidden" name="website" value="" />
              <div className={styles.progress} aria-label={formatMessage(dictionary["inquiry.stepOf"], { step })}>
                {[1, 2, 3, 4].map((item) => <span className={item <= step ? styles.progressActive : ""} key={item} />)}
                <b>0{step} / 04</b>
              </div>

              {step === 1 && (
                <section className={styles.step}>
                  <p className="eyebrow">{dictionary["inquiry.step1Eyebrow"]}</p>
                  <h2 id="inquiry-title" ref={stepHeadingRef} tabIndex={-1}>{dictionary["inquiry.step1Question"]}</h2>
                  <p className={styles.intro}>{dictionary["inquiry.step1Intro"]}</p>
                  <div className={styles.vehicleOptions}>
                    {vehicleOptions.map((option, index) => (
                      <button
                        className={vehicle === option.slug ? styles.vehicleOptionActive : ""}
                        type="button"
                        key={option.slug}
                        onClick={() => {
                          setVehicle(option.slug);
                          setPickupDate("");
                          setReturnDate("");
                        }}
                        aria-pressed={vehicle === option.slug}
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{option.label}</strong>
                        <b>{vehicle === option.slug ? dictionary["inquiry.selected"] : dictionary["inquiry.select"]} ↗</b>
                      </button>
                    ))}
                  </div>
                  <div className={styles.stepActions}>
                    <span>{dictionary["inquiry.selectOne"]}</span>
                    <button className="button" type="button" disabled={!vehicle} onClick={() => setStep(2)}>{dictionary["inquiry.toDates"]} <b>→</b></button>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className={styles.step}>
                  <p className="eyebrow">{dictionary["inquiry.step2Eyebrow"]}</p>
                  <h2 id="inquiry-title" ref={stepHeadingRef} tabIndex={-1}>{dictionary["inquiry.step2Question"]}</h2>
                  <p className={styles.intro}>
                    {hasMonthlyPrice || vehicle === "other"
                      ? dictionary["inquiry.monthlyAvailable"]
                      : dictionary["inquiry.monthlyUnavailable"]}
                  </p>
                  <DateRangeCalendar
                    pickupDate={pickupDate}
                    returnDate={returnDate}
                    maxRentalDays={maxRentalDays}
                    unavailablePeriods={selectedVehicle?.unavailablePeriods ?? []}
                    onChange={(pickup, returning) => { setPickupDate(pickup); setReturnDate(returning); }}
                    locale={locale}
                    dictionary={dictionary}
                  />
                  <div className={styles.stepActions}>
                    <button className={styles.backButton} type="button" onClick={() => setStep(1)}>← {dictionary["action.back"]}</button>
                    <button className="button" type="button" disabled={!pickupDate || !returnDate} onClick={() => setStep(3)}>{dictionary["inquiry.toContact"]} <b>→</b></button>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className={styles.step}>
                  <p className="eyebrow">{dictionary["inquiry.step3Eyebrow"]}</p>
                  <h2 id="inquiry-title" ref={stepHeadingRef} tabIndex={-1}>{dictionary["inquiry.contactTitle"]}</h2>
                  <div className={styles.summary}>
                    <div><span>{dictionary["inquiry.vehicle"]}</span><strong>{selectedVehicleLabel}</strong></div>
                    <div><span>{dictionary["inquiry.pickup"]}</span><strong>{formatInquiryDate(pickupDate, locale, dictionary)}</strong></div>
                    <div><span>{dictionary["inquiry.return"]}</span><strong>{formatInquiryDate(returnDate, locale, dictionary)}</strong></div>
                  </div>
                  <div className={styles.form}>
                    <label><span>{dictionary["inquiry.name"]}</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} autoComplete="name" required minLength={2} /></label>
                    <label><span>{dictionary["inquiry.phone"]}</span><input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} type="tel" autoComplete="tel" required minLength={6} /></label>
                    <label className={styles.wide}><span>{dictionary["inquiry.email"]}</span><input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} type="email" autoComplete="email" required /></label>
                    <label className={styles.wide}><span>{dictionary["inquiry.note"]}</span><textarea value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} rows={3} placeholder={dictionary["inquiry.notePlaceholder"]} /></label>
                    <label className={`${styles.consent} ${styles.wide}`}>
                      <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} required />
                      <span>{dictionary["inquiry.consent"]}</span>
                    </label>
                    {state.status === "error" && <p className={`${styles.error} ${styles.wide}`} role="alert">{state.message}</p>}
                  </div>
                  <div className={styles.stepActions}>
                    <button className={styles.backButton} type="button" onClick={() => setStep(2)}>← {dictionary["action.back"]}</button>
                    <button className="button" type="button" onClick={() => { if (formRef.current?.reportValidity()) setStep(4); }}>{dictionary["inquiry.review"]} <b>→</b></button>
                  </div>
                </section>
              )}

              {step === 4 && (
                <section className={styles.step}>
                  <p className="eyebrow">{dictionary["inquiry.step4Eyebrow"]}</p>
                  <h2 id="inquiry-title" ref={stepHeadingRef} tabIndex={-1}>{dictionary["inquiry.reviewTitle"]}</h2>
                  <p className={styles.intro}>{dictionary["inquiry.reviewIntro"]}</p>
                  <div className={styles.confirmationGrid}>
                    <div><span>{dictionary["inquiry.vehicle"]}</span><strong>{selectedVehicleLabel}</strong></div>
                    <div><span>{dictionary["inquiry.period"]}</span><strong>{formatInquiryDate(pickupDate, locale, dictionary)} – {formatInquiryDate(returnDate, locale, dictionary)}</strong></div>
                    <div><span>{dictionary["inquiry.days"]}</span><strong>{rentalDays}</strong></div>
                    <div><span>{dictionary["inquiry.contact"]}</span><strong>{customerName}<small>{customerPhone} · {customerEmail}</small></strong></div>
                  </div>
                  <div className={styles.priceConfirmation}>
                    <div>
                      <span>{dictionary["inquiry.calculation"]}</span>
                      {selectedTier ? (
                        <p>{selectedTier.pricingMode === "fixed"
                          ? formatMessage(dictionary["inquiry.fixedPrice"], { days: rentalDays })
                          : formatMessage(dictionary["inquiry.dailyPrice"], { days: rentalDays, price: formatRsd(selectedTier.priceRsd) })}</p>
                      ) : (
                        <p>{dictionary["inquiry.teamConfirms"]}</p>
                      )}
                    </div>
                    <div>
                      <span>{dictionary["inquiry.total"]}</span>
                      <strong>{estimatedTotal != null ? formatRsd(estimatedTotal) : dictionary["inquiry.onRequest"]}</strong>
                    </div>
                  </div>
                  {customerNote && <div className={styles.confirmationNote}><span>{dictionary["inquiry.note"]}</span><p>{customerNote}</p></div>}
                  {state.status === "error" && <p className={styles.error} role="alert">{state.message}</p>}
                  <div className={styles.stepActions}>
                    <button className={styles.backButton} type="button" onClick={() => setStep(3)}>← {dictionary["inquiry.edit"]}</button>
                    <button className="button" type="submit" disabled={pending}>{pending ? dictionary["inquiry.sending"] : dictionary["inquiry.submit"]} <b>↗</b></button>
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

export default function InquiryModal({
  vehicles,
  locale,
  dictionary,
}: {
  vehicles: InquiryVehicle[];
  locale: Locale;
  dictionary: Dictionary;
}) {
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

  return open ? (
    <InquiryDialog
      vehicles={vehicles}
      initialVehicle={selectedVehicle}
      onClose={() => setOpen(false)}
      locale={locale}
      dictionary={dictionary}
    />
  ) : null;
}
