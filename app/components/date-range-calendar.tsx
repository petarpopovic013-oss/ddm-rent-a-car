"use client";

import { useMemo, useState } from "react";
import styles from "./inquiry-modal.module.css";

const weekdays = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];
const monthFormatter = new Intl.DateTimeFormat("sr-Latn-RS", { month: "long", year: "numeric" });
const dateFormatter = new Intl.DateTimeFormat("sr-Latn-RS", { day: "numeric", month: "long", year: "numeric" });

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromIso(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function differenceInDays(start: string, end: string) {
  return Math.round((dateFromIso(end).getTime() - dateFromIso(start).getTime()) / 86_400_000);
}

export function formatInquiryDate(value: string) {
  return value ? dateFormatter.format(dateFromIso(value)) : "Nije izabrano";
}

export default function DateRangeCalendar({
  pickupDate,
  returnDate,
  unavailablePeriods,
  onChange,
}: {
  pickupDate: string;
  returnDate: string;
  unavailablePeriods: { pickupDate: string; returnDate: string }[];
  onChange: (pickupDate: string, returnDate: string) => void;
}) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  }, []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1, 12),
  );
  const todayIso = isoDate(today);
  const choosingReturn = Boolean(pickupDate && !returnDate);
  const firstWeekday = (visibleMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day >= 1 && day <= daysInMonth
      ? new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day, 12)
      : null;
  });
  const canGoBack = visibleMonth.getFullYear() > today.getFullYear()
    || visibleMonth.getMonth() > today.getMonth();
  const isUnavailable = (value: string) => unavailablePeriods.some(
    (period) => value >= period.pickupDate && value <= period.returnDate,
  );
  const rangeContainsUnavailableDate = (start: string, end: string) => unavailablePeriods.some(
    (period) => period.pickupDate <= end && period.returnDate >= start,
  );

  const selectDate = (value: string) => {
    if (!pickupDate || returnDate) {
      onChange(value, "");
      return;
    }
    if (
      value >= pickupDate
      && differenceInDays(pickupDate, value) <= 29
      && !rangeContainsUnavailableDate(pickupDate, value)
    ) {
      onChange(pickupDate, value);
    }
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarStatus} aria-live="polite">
        <div className={pickupDate ? styles.calendarStatusDone : styles.calendarStatusActive}>
          <span>01 · Preuzimanje</span>
          <strong>{formatInquiryDate(pickupDate)}</strong>
        </div>
        <div className={choosingReturn ? styles.calendarStatusActive : returnDate ? styles.calendarStatusDone : ""}>
          <span>02 · Vraćanje</span>
          <strong>{formatInquiryDate(returnDate)}</strong>
        </div>
      </div>
      <div className={styles.calendarHeader}>
        <button
          type="button"
          onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1, 12))}
          disabled={!canGoBack}
          aria-label="Prethodni mesec"
        >←</button>
        <strong>{monthFormatter.format(visibleMonth)}</strong>
        <button
          type="button"
          onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1, 12))}
          aria-label="Sledeći mesec"
        >→</button>
      </div>
      <div className={styles.calendarWeekdays} aria-hidden="true">
        {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>
      <div className={styles.calendarGrid}>
        {cells.map((date, index) => {
          if (!date) return <span className={styles.calendarEmpty} key={`empty-${index}`} />;
          const value = isoDate(date);
          const beforeToday = value < todayIso;
          const beforePickup = choosingReturn && value < pickupDate;
          const beyondRange = choosingReturn && differenceInDays(pickupDate, value) > 29;
          const unavailable = isUnavailable(value);
          const crossesUnavailable = choosingReturn
            && value >= pickupDate
            && rangeContainsUnavailableDate(pickupDate, value);
          const disabled = beforeToday || beforePickup || beyondRange || unavailable || crossesUnavailable;
          const selected = value === pickupDate || value === returnDate;
          const inRange = Boolean(pickupDate && returnDate && value > pickupDate && value < returnDate);
          const className = [
            selected ? styles.calendarSelected : "",
            inRange ? styles.calendarInRange : "",
          ].filter(Boolean).join(" ");
          return (
            <button
              type="button"
              className={className}
              key={value}
              onClick={() => selectDate(value)}
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`${dateFormatter.format(date)}${disabled ? ", nije dostupno" : ""}`}
            >
              <span>{date.getDate()}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.calendarFooter}>
        <p>{choosingReturn ? "Izaberite datum vraćanja. Zauzeti termini i rasponi koji ih prelaze nisu dostupni." : returnDate ? "Termin je izabran. Možete nastaviti ili promeniti raspon." : "Prvo izaberite datum preuzimanja. Precrtani datumi su zauzeti."}</p>
        {pickupDate && <button type="button" onClick={() => onChange("", "")}>Promeni termin</button>}
      </div>
    </div>
  );
}
