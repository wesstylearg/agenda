/**
 * ==========================================================================
 * EVENTS VIEW CONTROLLER (APPLE HIG)
 * List & Filter for Academic Exams, Assignments and Milestones
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';
import { EventForm } from './event-form.js';
import { CalendarEvents } from '../calendar/calendar-events.js';

export const EventsModule = {
  currentFilter: 'all', // 'all' | 'parcial' | 'tp' | 'final' | 'recuperatorio'

  render(containerEl, state, modalContainer) {
    containerEl.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'view-content';

    // Header Row
    const headerRow = document.createElement('div');
    headerRow.className = 'section-header';
    headerRow.innerHTML = `
      <div>
        <h2 class="h2">Eventos y Exámenes</h2>
        <p class="section-subtitle">${state.events.length} evento(s) registrados</p>
      </div>
      <button type="button" class="btn btn-primary" id="btn-add-event-top">
        ${Utils.getIcon('plus', 16)}
        <span>Nuevo Evento</span>
      </button>
    `;
    wrapper.appendChild(headerRow);

    headerRow.querySelector('#btn-add-event-top').addEventListener('click', () => {
      EventForm.open(modalContainer, state, null, {}, () => this.render(containerEl, state, modalContainer));
    });

    // Filter Chips
    const filtersRow = document.createElement('div');
    filtersRow.className = 'flex items-center gap-xs';
    filtersRow.style.overflowX = 'auto';
    filtersRow.style.paddingBottom = '10px';
    filtersRow.style.marginBottom = '8px';

    const filterOptions = [
      { id: 'all', label: 'Todos' },
      { id: 'parcial', label: 'Parciales' },
      { id: 'tp', label: 'TPs / Entregas' },
      { id: 'final', label: 'Finales' },
      { id: 'recuperatorio', label: 'Recuperatorios' }
    ];

    filterOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = `btn btn-sm ${this.currentFilter === opt.id ? 'btn-primary' : 'btn-secondary'}`;
      btn.textContent = opt.label;
      btn.type = 'button';
      btn.addEventListener('click', () => {
        this.currentFilter = opt.id;
        this.render(containerEl, state, modalContainer);
      });
      filtersRow.appendChild(btn);
    });

    wrapper.appendChild(filtersRow);

    let events = [...state.events];
    if (this.currentFilter === 'parcial') {
      events = events.filter(e => e.type === 'parcial');
    } else if (this.currentFilter === 'tp') {
      events = events.filter(e => e.type === 'tp' || e.type === 'entrega');
    } else if (this.currentFilter === 'final') {
      events = events.filter(e => e.type === 'final');
    } else if (this.currentFilter === 'recuperatorio') {
      events = events.filter(e => e.type === 'recuperatorio');
    }

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (events.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'card empty-state';
      empty.innerHTML = `
        <div class="empty-state-icon-wrap">${Utils.getIcon('calendar', 24)}</div>
        <div class="empty-state-title">No hay eventos en esta categoría</div>
        <div class="empty-state-desc">Registrá fechas de parciales, entregas de trabajos prácticos o mesas de examen final.</div>
        <button type="button" class="btn btn-primary btn-sm" id="btn-add-event-empty">
          ${Utils.getIcon('plus', 16)}
          <span>Agregar Evento</span>
        </button>
      `;
      empty.querySelector('#btn-add-event-empty').addEventListener('click', () => {
        EventForm.open(modalContainer, state, null, {}, () => this.render(containerEl, state, modalContainer));
      });
      wrapper.appendChild(empty);
    } else {
      const listContainer = document.createElement('div');
      listContainer.style.display = 'flex';
      listContainer.style.flexDirection = 'column';
      listContainer.style.gap = '10px';

      events.forEach(ev => {
        const sub = state.getSubjectById(ev.subjectId);
        const styleInfo = CalendarEvents.EVENT_TYPE_STYLES[ev.type] || CalendarEvents.EVENT_TYPE_STYLES.otro;

        const card = document.createElement('div');
        card.className = 'card card-clickable';
        card.style.borderLeft = `4px solid ${styleInfo.color}`;

        const statusLabel = ev.status === 'completado' ? 'Completado' : ev.status === 'en_progreso' ? 'En Progreso' : 'Pendiente';
        const statusClass = ev.status === 'completado' ? 'promoted' : ev.status === 'en_progreso' ? 'approved' : 'pending';

        card.innerHTML = `
          <div class="flex items-center justify-between" style="margin-bottom: 4px;">
            <div class="flex items-center gap-xs">
              <span class="badge" style="background: ${styleInfo.color}22; color: ${styleInfo.color}; border: 1px solid ${styleInfo.color}44;">
                ${styleInfo.label}
              </span>
              ${sub ? `<span class="badge" style="background: var(--bg-surface-raised); color: var(--text-secondary); border: 1px solid var(--border-subtle);">${Utils.escapeHTML(sub.name)}</span>` : ''}
            </div>
            <span class="status-pill ${statusClass}">${statusLabel}</span>
          </div>

          <h3 class="h3 truncate" style="color: var(--text-primary); font-size: 15px; margin-bottom: 4px;">${Utils.escapeHTML(ev.title)}</h3>

          <div class="flex items-center justify-between text-xs text-secondary">
            <div class="flex items-center gap-xs">
              ${Utils.getIcon('calendar', 12)}
              <span>${Utils.formatDateNatural(ev.date)} • ${Utils.escapeHTML(ev.startTime)}–${Utils.escapeHTML(ev.endTime)}</span>
            </div>
            ${ev.grade !== null && ev.grade !== undefined ? `<div class="font-bold text-accent" style="font-size: 13px;">Nota: ${ev.grade}</div>` : ''}
          </div>

          ${ev.description ? `<div class="text-xs text-muted" style="margin-top: 6px;">${Utils.escapeHTML(ev.description)}</div>` : ''}
        `;

        card.addEventListener('click', () => {
          EventForm.open(modalContainer, state, ev, {}, () => this.render(containerEl, state, modalContainer));
        });

        listContainer.appendChild(card);
      });

      wrapper.appendChild(listContainer);
    }

    containerEl.appendChild(wrapper);
  }
};
