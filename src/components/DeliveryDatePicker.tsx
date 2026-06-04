"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import styles from "./DeliveryDatePicker.module.css";

interface DeliveryDatePickerProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onCancel: () => void;
  disabledDates?: string[]; // ISO date strings to disable
}

export function DeliveryDatePicker({
  selectedDate,
  onSelect,
  onCancel,
  disabledDates = [],
}: DeliveryDatePickerProps) {
  const { t } = useI18n();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const dayLabels = [
    t("delivery.sun"),
    t("delivery.mon"),
    t("delivery.tue"),
    t("delivery.wed"),
    t("delivery.thu"),
    t("delivery.fri"),
    t("delivery.sat"),
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days: (number | null)[] = [];
    // Pad leading empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [viewMonth, viewYear]);

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  const isPast = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const toISO = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d.toISOString().split("T")[0];
  };

  const isDisabled = (day: number) => {
    return isPast(day) || disabledDates.includes(toISO(day));
  };

  const isSelected = (day: number) => {
    return selectedDate === toISO(day);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return (
    <div className={styles.container}>
      {/* Month Navigation */}
      <div className={styles.header}>
        <span className={styles.monthLabel}>
          {monthNames[viewMonth]} {viewYear}
        </span>
        <div className={styles.navButtons}>
          <button className={styles.navBtn} onClick={prevMonth}>
            <ChevronLeft size={16} />
          </button>
          <button className={styles.navBtn} onClick={nextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className={styles.dayHeaders}>
        {dayLabels.map((d) => (
          <div key={d} className={styles.dayHeader}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={styles.calendarGrid}>
        {calendarDays.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className={`${styles.dayCell} ${styles.dayCellEmpty}`} />;
          }

          const disabled = isDisabled(day);
          const selected = isSelected(day);
          const todayClass = isToday(day);

          return (
            <button
              key={day}
              className={[
                styles.dayCell,
                todayClass ? styles.dayCellToday : "",
                selected ? styles.dayCellSelected : "",
                disabled ? styles.dayCellDisabled : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (!disabled) {
                  onSelect(toISO(day));
                }
              }}
              disabled={disabled}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          {t("gift.cancel")}
        </button>
      </div>
    </div>
  );
}
