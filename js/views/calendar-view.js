/**
 * ==========================================================================
 * CALENDAR VIEW CONTROLLER
 * Integrates Weekly, Monthly, and Cuatrimestral Views with Modals
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { CalendarController } from '../calendar/calendar.js';
import { EventForm } from '../events/event-form.js';
import { SubjectForm } from '../subjects/subject-form.js';

export const CalendarView = {
  render(containerEl, state, modalContainer) {
    CalendarController.init(containerEl, state, {
      onItemClick: (item) => {
        if (item.itemType === 'event') {
          const ev = state.getEventById(item.id);
          if (ev) {
            EventForm.open(modalContainer, state, ev, {}, () => CalendarController.render());
          }
        } else if (item.itemType === 'class') {
          const sub = state.getSubjectById(item.subjectId);
          if (sub) {
            SubjectForm.open(modalContainer, state, sub, () => CalendarController.render());
          }
        }
      },
      onEmptySlotClick: (slotInfo) => {
        EventForm.open(modalContainer, state, null, {
          date: slotInfo.date,
          startTime: slotInfo.startTime,
          endTime: slotInfo.endTime
        }, () => CalendarController.render());
      }
    });
  }
};
