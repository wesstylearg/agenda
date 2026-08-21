/**
 * ==========================================================================
 * CALENDAR EVENTS RENDERER (APPLE HIG)
 * Creates chip elements for classes and events with layout geometry
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';
import { CalendarLayout } from './calendar-layout.js';

export const CalendarEvents = {
  /**
   * Type metadata mapping for visual styling
   */
  EVENT_TYPE_STYLES: {
    parcial: { label: 'Parcial', color: '#ff375f', bg: 'rgba(255, 55, 95, 0.16)', isExam: true },
    tp: { label: 'TP', color: '#bf5af2', bg: 'rgba(191, 90, 242, 0.16)', isExam: false },
    entrega: { label: 'Entrega', color: '#ff9f0a', bg: 'rgba(255, 159, 10, 0.16)', isExam: false },
    final: { label: 'Final', color: '#ff453a', bg: 'rgba(255, 69, 58, 0.16)', isExam: true },
    recuperatorio: { label: 'Recup', color: '#ffd60a', bg: 'rgba(255, 214, 10, 0.16)', isExam: true },
    otro: { label: 'Evento', color: '#8e8e93', bg: 'rgba(142, 142, 147, 0.16)', isExam: false }
  },

  /**
   * Collect all schedule items for a given date
   */
  collectItemsForDay(dayDate, dayIndex, state) {
    const items = [];
    const isoDate = Utils.formatDateISO(dayDate);
    const subjects = state.subjects || [];
    const events = state.events || [];

    // 1. Recurring subject schedules
    subjects.forEach(subject => {
      if (Array.isArray(subject.schedules)) {
        subject.schedules.forEach((sched, sIdx) => {
          if (parseInt(sched.dayIndex, 10) === dayIndex) {
            items.push({
              itemType: 'class',
              id: `${subject.id}_sched_${sIdx}`,
              subjectId: subject.id,
              title: subject.name,
              professor: subject.professor,
              color: subject.color || '#5E5CE6',
              startTime: sched.startTime || '08:00',
              endTime: sched.endTime || '10:00',
              classroom: sched.classroom || '',
              notes: subject.notes,
              isExam: false
            });
          }
        });
      }
    });

    // 2. Specific calendar events on this ISO date
    events.forEach(event => {
      if (event.date === isoDate) {
        const sub = subjects.find(s => s.id === event.subjectId);
        const styleInfo = this.EVENT_TYPE_STYLES[event.type] || this.EVENT_TYPE_STYLES.otro;

        items.push({
          itemType: 'event',
          id: event.id,
          subjectId: event.subjectId,
          title: event.title,
          subName: sub ? sub.name : '',
          color: sub ? sub.color : styleInfo.color,
          bgStyle: styleInfo.bg,
          type: event.type,
          typeLabel: styleInfo.label,
          typeColor: styleInfo.color,
          isExam: !!styleInfo.isExam,
          startTime: event.startTime || '08:00',
          endTime: event.endTime || '10:00',
          classroom: '',
          description: event.description,
          priority: event.priority,
          status: event.status,
          grade: event.grade
        });
      }
    });

    return items;
  },

  /**
   * Render all chips for a single day column and append them to dayBodyEl
   */
  renderDayChips(dayBodyEl, dayDate, dayIndex, state, onChipClick) {
    const rawItems = this.collectItemsForDay(dayDate, dayIndex, state);
    const layoutItems = CalendarLayout.layoutDayItems(rawItems);

    layoutItems.forEach(item => {
      const chip = document.createElement('div');
      
      let typeClass = 'chip-event';
      if (item.itemType === 'class') {
        typeClass = 'chip-class';
      } else if (item.isExam) {
        typeClass = `chip-event chip-exam chip-${item.type}`;
      }

      chip.className = `cal-chip ${typeClass}`;

      if (item.durationMin < 50) {
        chip.classList.add('chip-compact');
      }

      chip.style.top = `${item.topPercent}%`;
      chip.style.height = `${item.heightPercent}%`;
      chip.style.left = `calc(${item.leftPercent}% + 2px)`;
      chip.style.width = `calc(${item.widthPercent}% - 4px)`;

      chip.style.setProperty('--chip-accent-color', item.color);
      if (item.bgStyle) {
        chip.style.setProperty('--chip-bg-color', item.bgStyle);
      }

      if (item.itemType === 'class') {
        chip.innerHTML = `
          <div class="cal-chip-title" title="${Utils.escapeHTML(item.title)}">${Utils.escapeHTML(item.title)}</div>
          <div class="cal-chip-time">${Utils.escapeHTML(item.startTime)} – ${Utils.escapeHTML(item.endTime)}</div>
          ${item.classroom ? `
            <div class="cal-chip-room" style="display: flex; align-items: center; gap: 3px;">
              ${Utils.getIcon('pin', 10)}
              <span>${Utils.escapeHTML(item.classroom)}</span>
            </div>` : ''}
        `;
      } else {
        const iconSvg = item.type === 'final' 
          ? Utils.getIcon('gradCap', 10) 
          : item.type === 'parcial' 
          ? Utils.getIcon('document', 10) 
          : '';

        chip.innerHTML = `
          <div class="cal-chip-type-tag" style="background-color: ${item.typeColor}; color: #ffffff; display: flex; align-items: center; gap: 3px;">
            ${iconSvg}
            <span>${item.typeLabel}</span>
          </div>
          <div class="cal-chip-title" title="${Utils.escapeHTML(item.title)}">${Utils.escapeHTML(item.title)}</div>
          <div class="cal-chip-time">${Utils.escapeHTML(item.startTime)} – ${Utils.escapeHTML(item.endTime)}</div>
          ${item.grade !== null && item.grade !== undefined ? `<div class="cal-chip-room" style="font-weight: 700; color: var(--color-success);">Nota: ${item.grade}</div>` : ''}
        `;
      }

      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof onChipClick === 'function') {
          onChipClick(item);
        }
      });

      dayBodyEl.appendChild(chip);
    });
  }
};
