/**
 * ==========================================================================
 * CALENDAR UTILITIES MODULE
 * Date arithmetic, week ranges, and month matrix generators
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';

export const CalendarUtils = {
  /**
   * Return Date object representing the Monday of the week for a given date
   */
  getMondayOfWeek(dateInput = new Date()) {
    const d = Utils.toDateObject(dateInput);
    const day = (d.getDay() + 6) % 7; // 0 for Monday, ..., 6 for Sunday
    const monday = new Date(d);
    monday.setDate(d.getDate() - day);
    monday.setHours(0, 0, 0, 0);
    return monday;
  },

  /**
   * Return an array of 7 Date objects (Monday to Sunday) for the given week's Monday
   */
  getWeekDates(mondayDate) {
    const dates = [];
    const base = new Date(mondayDate);
    base.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d);
    }
    return dates;
  },

  /**
   * Return Monday of next week (+7 days)
   */
  getNextWeekMonday(mondayDate) {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + 7);
    return d;
  },

  /**
   * Return Monday of previous week (-7 days)
   */
  getPrevWeekMonday(mondayDate) {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() - 7);
    return d;
  },

  /**
   * Format week range header: e.g. "17 Ago – 23 Ago 2026"
   */
  formatWeekRange(mondayDate) {
    const weekDates = this.getWeekDates(mondayDate);
    const first = weekDates[0];
    const last = weekDates[6];

    const d1 = first.getDate();
    const m1 = Utils.MONTHS_SHORT[first.getMonth()];
    const d2 = last.getDate();
    const m2 = Utils.MONTHS_SHORT[last.getMonth()];
    const y2 = last.getFullYear();

    if (m1 === m2) {
      return `${d1} – ${d2} ${m1} ${y2}`;
    }
    return `${d1} ${m1} – ${d2} ${m2} ${y2}`;
  },

  /**
   * Check if a specific date falls within the week starting at mondayDate
   */
  isDateInWeek(targetDate, mondayDate) {
    const target = Utils.toDateObject(targetDate);
    if (!target) return false;

    const start = new Date(mondayDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return target >= start && target < end;
  },

  /**
   * Generate complete 6-row or 5-row calendar grid matrix (Array of day objects) for Month View
   */
  getMonthMatrix(year, monthIndex) {
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

    // Day of week for 1st of month (0 = Mon, 6 = Sun)
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDays = lastDayOfMonth.getDate();

    const days = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(year, monthIndex - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        isoString: Utils.formatDateISO(d),
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: Utils.isSameDay(d, new Date())
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const d = new Date(year, monthIndex, dayNum);
      days.push({
        date: d,
        isoString: Utils.formatDateISO(d),
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: Utils.isSameDay(d, new Date())
      });
    }

    // Next month filler days to complete grid (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, monthIndex + 1, i);
      days.push({
        date: d,
        isoString: Utils.formatDateISO(d),
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: Utils.isSameDay(d, new Date())
      });
    }

    return days;
  },

  /**
   * Return the 4-6 months spanning the current semester / term
   */
  getSemesterMonths(baseDate = new Date()) {
    const currentMonth = baseDate.getMonth(); // 0-11
    const currentYear = baseDate.getFullYear();

    // In typical university semesters:
    // 1st term: March (2) to July (6)
    // 2nd term: August (7) to December (11)
    let startMonth = currentMonth < 7 ? 2 : 7;
    let endMonth = currentMonth < 7 ? 6 : 11;

    const months = [];
    for (let m = startMonth; m <= endMonth; m++) {
      months.push({
        year: currentYear,
        monthIndex: m,
        monthName: Utils.MONTHS_FULL[m]
      });
    }
    return months;
  }
};
