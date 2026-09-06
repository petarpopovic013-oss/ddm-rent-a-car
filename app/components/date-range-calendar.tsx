"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localeConfig } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/translations";
import { formatMessage } from "@/lib/i18n/translations";
import styles from "./inquiry-modal.module.css";

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

export function formatInquiryDate(value: string, locale: Locale, dictionary: Dictionary) {
  const formatter = new Intl.DateTimeFormat(localeConfig[locale].intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return value ? formatter.format(dateFromIso(value)) : dictionary["common.notSelected"];
}

export default function DateRangeCalendar({
  pickupDate,
  returnDate,
  maxRentalDays,
  unavailablePeriods,
  onChange,
  locale,
  dictionary,
}: {
  pickupDate: string;
  returnDate: string;
  maxRentalDays: 25 | 31;
  unavailablePeriods: { pickupDate: string; returnDate: string }[];
  onChange: (pickupDate: string, returnDate: string) => void;
  locale: Locale;
  dictionary: Dictionary;
}) {
  const intlLocale = localeConfig[locale].intlLocale;
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" }),
    [intlLocale],
  );
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "long", year: "numeric" }),
    [intlLocale],
  );
  const weekdays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, index + 1)));
  }, [intlLocale]);
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
      && differenceInDays(pickupDate, value) <= maxRentalDays - 1
      && !rangeContainsUnavailableDate(pickupDate, value)
    ) {
      onChange(pickupDate, value);
    }
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarStatus} aria-live="polite">
        <div className={pickupDate ? styles.calendarStatusDone : styles.calendarStatusActive}>
          <span>01 · {dictionary["calendar.pickup"]}</span>
          <strong>{formatInquiryDate(pickupDate, locale, dictionary)}</strong>
        </div>
        <div className={choosingReturn ? styles.calendarStatusActive : returnDate ? styles.calendarStatusDone : ""}>
          <span>02 · {dictionary["calendar.return"]}</span>
          <strong>{formatInquiryDate(returnDate, locale, dictionary)}</strong>
        </div>
      </div>
      <div className={styles.calendarHeader}>
        <button
          type="button"
          onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1, 12))}
          disabled={!canGoBack}
          aria-label={dictionary["calendar.previousMonth"]}
        >←</button>
        <strong>{monthFormatter.format(visibleMonth)}</strong>
        <button
          type="button"
          onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1, 12))}
          aria-label={dictionary["calendar.nextMonth"]}
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
          const beyondRange = choosingReturn
            && differenceInDays(pickupDate, value) > maxRentalDays - 1;
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
              aria-label={`${dateFormatter.format(date)}${disabled ? `, ${dictionary["calendar.unavailable"]}` : ""}`}
            >
              <span>{date.getDate()}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.calendarFooter}>
        <p>{choosingReturn
          ? formatMessage(dictionary["calendar.chooseReturn"], { days: maxRentalDays })
          : returnDate
            ? dictionary["calendar.selected"]
            : dictionary["calendar.choosePickup"]}</p>
        {pickupDate && <button type="button" onClick={() => onChange("", "")}>{dictionary["calendar.change"]}</button>}
      </div>
    </div>
  );
}
