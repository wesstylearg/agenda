/**
 * ==========================================================================
 * WEEKLY 7-DAY CALENDAR GRID ENGINE
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 *
 * Core Features:
 * - 7 real day columns (Mon to Sun)
 * - Mobile: exactly 3 days visible with CSS scroll-snap
 * - Simultaneous vertical and horizontal scrolling
 * - Sticky hour labels column and sticky day headers
 * - Real-time current time line indicator
 * - Auto-scroll to today & current hour
 */

import { Utils } from '../utils.js';
import { CalendarUtils } from './calendar-utils.js';
import { CalendarLayout } from './calendar-layout.js';
import { CalendarEvents } from './calendar-events.js';

export const CalendarGrid = {
  /**
   * Render the complete 7-day weekly grid into container
   */
  renderWeeklyGrid(containerEl, mondayDate, state, callbacks = {}) {
    containerEl.innerHTML = '';

    const weekDates = CalendarUtils.getWeekDates(mondayDate);
    const today = new Date();
    const isCurrentWeek = CalendarUtils.isDateInWeek(today, mondayDate);

    // Main Scroller Container
    const scroller = document.createElement('div');
    scroller.className = 'week-grid-scroller';

    // Grid Wrapper
    const grid = document.createElement('div');
    grid.className = 'week-grid';

    // 1. Time / Hour Column
    const timeCol = document.createElement('div');
    timeCol.className = 'time-col';

    const corner = document.createElement('div');
    corner.className = 'time-col-corner';
    timeCol.appendChild(corner);

    // 18 hour labels (06:00 to 23:00)
    for (let h = CalendarLayout.START_HOUR; h < CalendarLayout.END_HOUR; h++) {
      const slot = document.createElement('div');
      slot.className = 'time-slot-label';
      slot.textContent = `${String(h).padStart(2, '0')}:00`;
      timeCol.appendChild(slot);
    }
    grid.appendChild(timeCol);

    // 2. Days Container (7 columns)
    const daysContainer = document.createElement('div');
    daysContainer.className = 'days-container';

    let todayColEl = null;

    weekDates.forEach((d, dayIndex) => {
      const isToday = Utils.isSameDay(d, today);
      const dayCol = document.createElement('div');
      dayCol.className = `day-col ${isToday ? 'is-today' : ''}`;
      dayCol.dataset.date = Utils.formatDateISO(d);
      dayCol.dataset.dayIndex = dayIndex;

      if (isToday) {
        todayColEl = dayCol;
      }

      // Day Header (Sticky Top)
      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';
      dayHeader.innerHTML = `
        <span class="day-header-name">${Utils.DAYS_SHORT[dayIndex]}</span>
        <span class="day-header-number">${d.getDate()}</span>
      `;
      dayCol.appendChild(dayHeader);

      // Day Body
      const dayBody = document.createElement('div');
      dayBody.className = 'day-body';

      // 18 Horizontal Grid Lines
      for (let h = 0; h < CalendarLayout.TOTAL_HOURS; h++) {
        const line = document.createElement('div');
        line.className = 'day-hour-grid-line';
        line.style.top = `calc(var(--cal-hour-height) * ${h})`;
        dayBody.appendChild(line);
      }

      // Render Current Time Indicator if today
      if (isToday) {
        const nowGeom = CalendarLayout.getCurrentTimeGeometry(today);
        if (nowGeom) {
          const nowLine = document.createElement('div');
          nowLine.className = 'cal-now-indicator';
          nowLine.style.top = `${nowGeom.topPercent}%`;
          dayBody.appendChild(nowLine);
        }
      }

      // Render Class & Event Chips
      CalendarEvents.renderDayChips(dayBody, d, dayIndex, state, callbacks.onChipClick);

      // Click on empty space in day body to create event
      dayBody.addEventListener('click', (e) => {
        if (e.target === dayBody || e.target.classList.contains('day-hour-grid-line')) {
          const rect = dayBody.getBoundingClientRect();
          const offsetY = e.clientY - rect.top;
          const ratio = offsetY / rect.height;
          const clickedMinutes = Math.floor(CalendarLayout.START_MINUTES + ratio * CalendarLayout.TOTAL_MINUTES);
          
          // Snap to nearest 30 minutes
          const snappedMinutes = Math.floor(clickedMinutes / 30) * 30;
          const startTimeStr = Utils.minutesToTime(snappedMinutes);
          const endTimeStr = Utils.minutesToTime(snappedMinutes + 60);

          if (typeof callbacks.onEmptySlotClick === 'function') {
            callbacks.onEmptySlotClick({
              date: Utils.formatDateISO(d),
              startTime: startTimeStr,
              endTime: endTimeStr
            });
          }
        }
      });

      dayCol.appendChild(dayBody);
      daysContainer.appendChild(dayCol);
    });

    grid.appendChild(daysContainer);
    scroller.appendChild(grid);
    containerEl.appendChild(scroller);

    // Auto-scroll logic
    this.scrollToRelevantPosition(scroller, todayColEl, isCurrentWeek);

    return scroller;
  },

  /**
   * Smoothly scroll to today and current hour
   */
  scrollToRelevantPosition(scroller, todayColEl, isCurrentWeek) {
    requestAnimationFrame(() => {
      // 1. Horizontal Scroll to Today on mobile
      if (todayColEl && isCurrentWeek) {
        const hourColWidth = 48;
        const colWidth = (window.innerWidth - hourColWidth) / 3;
        const dayIndex = parseInt(todayColEl.dataset.dayIndex, 10) || 0;
        
        // Center or scroll to today's column
        const targetScrollLeft = Math.max(0, dayIndex * colWidth);
        scroller.scrollLeft = targetScrollLeft;
      }

      // 2. Vertical Scroll to current hour or 08:00
      const now = new Date();
      const currentHour = now.getHours();
      let targetHour = 8; // Default 08:00

      if (isCurrentWeek && currentHour >= 6 && currentHour <= 23) {
        targetHour = Math.max(6, currentHour - 1);
      }

      const hourHeight = 54;
      const targetScrollTop = (targetHour - CalendarLayout.START_HOUR) * hourHeight;
      scroller.scrollTop = targetScrollTop;
    });
  }
};
