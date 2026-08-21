/**
 * ==========================================================================
 * HOME VIEW (INICIO) - APPLE DESIGN SYSTEM
 * Minimalist, Uncluttered, Clean Hierarchy
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';
import { Notifications } from '../notifications/notifications.js';
import { CalendarEvents } from '../calendar/calendar-events.js';
import { TaskForm } from '../tasks/task-form.js';
import { EventForm } from '../events/event-form.js';

export const HomeView = {
  render(containerEl, state, modalContainer, navigateTo) {
    containerEl.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'view-content';

    const today = new Date();
    const todayNatural = Utils.formatDateNatural(today);
    const dayOfWeekIndex = (today.getDay() + 6) % 7; // 0=Mon..6=Sun

    const notices = Notifications.getUpcomingNotices(state, today);
    const activeTasks = state.tasks.filter(t => t.status !== 'completado');

    // 1. Sleek Top Bar with Date & Action Buttons (Campanita & Reloj)
    const topHeader = document.createElement('div');
    topHeader.className = 'flex items-center justify-between';
    topHeader.style.marginBottom = '22px';
    topHeader.style.paddingTop = '4px';

    topHeader.innerHTML = `
      <div>
        <div class="text-xs font-semibold text-accent" style="text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px;">
          ${todayNatural}
        </div>
        <h1 class="h1" style="font-size: 26px; letter-spacing: -0.03em;">Agenda Semanal</h1>
      </div>

      <!-- Action Buttons: Bell & Clock -->
      <div class="header-actions-group">
        <!-- Bell (Avisos) -->
        <button type="button" class="header-icon-btn" id="btn-top-notices" aria-label="Avisos y notificaciones">
          ${Utils.getIcon('bell', 20)}
          ${notices.length > 0 ? `<span class="header-badge">${notices.length}</span>` : ''}
        </button>

        <!-- Clock (Pendientes) -->
        <button type="button" class="header-icon-btn" id="btn-top-tasks" aria-label="Lista rápida de pendientes">
          ${Utils.getIcon('clock', 20)}
          ${activeTasks.length > 0 ? `<span class="header-badge" style="background-color: var(--color-warning);">${activeTasks.length}</span>` : ''}
        </button>
      </div>
    `;

    // Bell click: opens Notices Modal
    topHeader.querySelector('#btn-top-notices').addEventListener('click', () => {
      Notifications.openNoticesModal(modalContainer, state, (item) => {
        if (item.type === 'event') {
          const ev = state.getEventById(item.entityId);
          if (ev) EventForm.open(modalContainer, state, ev, {}, () => this.render(containerEl, state, modalContainer, navigateTo));
        } else if (item.type === 'task') {
          const t = state.getTaskById(item.entityId);
          if (t) TaskForm.open(modalContainer, state, t, () => this.render(containerEl, state, modalContainer, navigateTo));
        }
      });
    });

    // Clock click: opens quick tasks sheet
    topHeader.querySelector('#btn-top-tasks').addEventListener('click', () => {
      this.openQuickTasksSheet(modalContainer, state, navigateTo);
    });

    wrapper.appendChild(topHeader);

    // 2. Mini Calendario del Día (Today's Mini Timeline)
    const todayItems = CalendarEvents.collectItemsForDay(today, dayOfWeekIndex, state);
    todayItems.sort((a, b) => Utils.timeToMinutes(a.startTime) - Utils.timeToMinutes(b.startTime));

    const daySection = document.createElement('div');
    daySection.className = 'section-block';

    daySection.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <span style="color: var(--color-accent);">${Utils.getIcon('calendar', 18)}</span>
          <span>Cronograma de Hoy</span>
        </h2>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-goto-calendar" style="gap: 4px;">
          <span>Ver Semana</span>
          ${Utils.getIcon('chevronRight', 14)}
        </button>
      </div>
    `;

    daySection.querySelector('#btn-goto-calendar').addEventListener('click', () => {
      if (typeof navigateTo === 'function') navigateTo('calendar');
    });

    if (todayItems.length === 0) {
      const emptyDayCard = document.createElement('div');
      emptyDayCard.className = 'card empty-state';
      emptyDayCard.style.padding = '32px 16px';
      emptyDayCard.innerHTML = `
        <div class="empty-state-icon-wrap">${Utils.getIcon('calendar', 22)}</div>
        <div class="empty-state-title">Día libre</div>
        <div class="empty-state-desc">No tenés clases ni actividades programadas para hoy.</div>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-add-event-today">
          ${Utils.getIcon('plus', 15)}
          <span>Agregar Actividad</span>
        </button>
      `;

      emptyDayCard.querySelector('#btn-add-event-today').addEventListener('click', () => {
        EventForm.open(modalContainer, state, null, { date: Utils.formatDateISO(today) }, () => {
          this.render(containerEl, state, modalContainer, navigateTo);
        });
      });

      daySection.appendChild(emptyDayCard);
    } else {
      const timelineContainer = document.createElement('div');
      timelineContainer.className = 'mini-day-container';

      todayItems.forEach(item => {
        const card = document.createElement('div');
        const isExam = item.isExam || item.type === 'parcial' || item.type === 'final' || item.type === 'recuperatorio';
        card.className = `mini-timeline-card ${isExam ? 'card-highlight' : ''}`;

        const itemColor = item.color || 'var(--color-accent)';
        const examIconSvg = item.type === 'final' 
          ? Utils.getIcon('gradCap', 11) 
          : isExam 
          ? Utils.getIcon('document', 11) 
          : '';

        const badgeHTML = item.typeLabel 
          ? `<span class="badge" style="background: ${item.typeColor}22; color: ${item.typeColor}; border: 1px solid ${item.typeColor}44; display: inline-flex; align-items: center; gap: 3px;">
              ${examIconSvg}
              <span>${isExam ? (item.type === 'final' ? 'FINAL HOY' : 'PARCIAL HOY') : item.typeLabel}</span>
            </span>`
          : `<span class="badge" style="background: var(--color-accent-subtle); color: var(--color-accent);">Clase</span>`;

        card.innerHTML = `
          <div class="mini-timeline-color-bar" style="background-color: ${itemColor}; ${isExam ? 'width: 5px;' : ''}"></div>
          <div class="mini-timeline-body">
            <div class="mini-timeline-header">
              <div class="mini-timeline-title ${isExam ? 'font-bold' : ''}">${Utils.escapeHTML(item.title)}</div>
              ${badgeHTML}
            </div>
            <div class="mini-timeline-meta">
              <span class="meta-item">
                ${Utils.getIcon('clock', 13)}
                <span>${Utils.escapeHTML(item.startTime)} – ${Utils.escapeHTML(item.endTime)}</span>
              </span>
              ${item.classroom ? `
                <span class="meta-item">
                  ${Utils.getIcon('pin', 13)}
                  <span>${Utils.escapeHTML(item.classroom)}</span>
                </span>
              ` : ''}
              ${item.professor ? `
                <span class="meta-item text-muted">
                  <span>${Utils.escapeHTML(item.professor)}</span>
                </span>
              ` : ''}
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          if (item.itemType === 'event') {
            const ev = state.getEventById(item.id);
            if (ev) EventForm.open(modalContainer, state, ev, {}, () => this.render(containerEl, state, modalContainer, navigateTo));
          }
        });

        timelineContainer.appendChild(card);
      });

      daySection.appendChild(timelineContainer);
    }

    wrapper.appendChild(daySection);

    // 3. Quick Action CTA Cards
    const quickBar = document.createElement('div');
    quickBar.className = 'section-block';
    quickBar.innerHTML = `
      <div class="flex items-center gap-sm">
        <button type="button" class="btn btn-secondary btn-full" id="btn-home-add-event">
          ${Utils.getIcon('plus', 16)}
          <span>Agregar un examen o evento</span>
        </button>
        <button type="button" class="btn btn-secondary btn-full" id="btn-home-add-task">
          ${Utils.getIcon('plus', 16)}
          <span>Agregar tarea pendiente</span>
        </button>
      </div>
    `;

    quickBar.querySelector('#btn-home-add-event').addEventListener('click', () => {
      EventForm.open(modalContainer, state, null, {}, () => this.render(containerEl, state, modalContainer, navigateTo));
    });

    quickBar.querySelector('#btn-home-add-task').addEventListener('click', () => {
      TaskForm.open(modalContainer, state, null, () => this.render(containerEl, state, modalContainer, navigateTo));
    });

    wrapper.appendChild(quickBar);

    containerEl.appendChild(wrapper);
  },

  /**
   * Quick Bottom Sheet showing pending tasks
   */
  openQuickTasksSheet(modalContainer, state, navigateTo) {
    const activeTasks = state.tasks
      .filter(t => t.status !== 'completado')
      .sort((a, b) => new Date(a.dueDate || '2099-01-01') - new Date(b.dueDate || '2099-01-01'));

    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="quick-tasks-overlay">
        <div class="modal-dialog" style="max-width: 500px;">
          <div class="modal-handle-bar"></div>
          <div class="modal-header">
            <div class="flex items-center gap-xs">
              <div style="color: var(--color-warning);">${Utils.getIcon('clock', 20)}</div>
              <h2 class="modal-title">Pendientes Activos</h2>
            </div>
            <button type="button" class="modal-close-btn" id="btn-close-quick-tasks" aria-label="Cerrar">${Utils.getIcon('close', 14)}</button>
          </div>
          <div class="modal-body">
            ${activeTasks.length === 0 ? `
              <div class="empty-state" style="padding: 32px 16px;">
                <div class="empty-state-icon-wrap" style="color: var(--color-success);">${Utils.getIcon('check', 24)}</div>
                <div class="empty-state-title">¡Todo al día!</div>
                <div class="empty-state-desc">No tenés pendientes activos registrados.</div>
                <button type="button" class="btn btn-primary btn-sm" id="btn-add-quick-task">
                  ${Utils.getIcon('plus', 16)}
                  <span>Crear Pendiente</span>
                </button>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${activeTasks.map(task => {
                  const sub = state.getSubjectById(task.subjectId);
                  const priorityClass = task.priority === 'alta' ? 'priority-high' : task.priority === 'media' ? 'priority-med' : 'priority-low';
                  const diff = Utils.daysDifference(task.dueDate, new Date());
                  let dueLabel = Utils.formatDateShort(task.dueDate);
                  if (diff === 0) dueLabel = 'Hoy';
                  else if (diff === 1) dueLabel = 'Mañana';

                  return `
                    <div class="card card-clickable flex items-center justify-between" data-task-id="${task.id}" style="padding: 12px 14px; gap: 10px;">
                      <button type="button" class="custom-checkbox ${task.status === 'en_progreso' ? 'in-progress' : ''}" data-chk-id="${task.id}">
                        ${task.status === 'en_progreso' ? '•' : ''}
                      </button>
                      <div style="flex: 1; min-width: 0;">
                        <div class="flex items-center gap-xs">
                          <span class="priority-dot ${priorityClass}"></span>
                          <div class="font-semibold text-primary text-sm truncate">${Utils.escapeHTML(task.title)}</div>
                        </div>
                        <div class="text-xs text-secondary truncate">
                          ${sub ? `${Utils.escapeHTML(sub.name)} • ` : ''}Vence: ${dueLabel}
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary btn-full" id="btn-add-task-from-sheet">
              ${Utils.getIcon('plus', 16)}
              <span>Agregar tarea pendiente</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const overlay = modalContainer.querySelector('#quick-tasks-overlay');
    const closeSheet = () => {
      overlay.classList.remove('active');
      setTimeout(() => { modalContainer.innerHTML = ''; }, 220);
    };

    modalContainer.querySelector('#btn-close-quick-tasks').addEventListener('click', closeSheet);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSheet();
    });

    const addBtn = modalContainer.querySelector('#btn-add-task-from-sheet');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        closeSheet();
        TaskForm.open(modalContainer, state, null, () => this.render(document.getElementById('view-home'), state, modalContainer, navigateTo));
      });
    }

    const emptyAdd = modalContainer.querySelector('#btn-add-quick-task');
    if (emptyAdd) {
      emptyAdd.addEventListener('click', () => {
        closeSheet();
        TaskForm.open(modalContainer, state, null, () => this.render(document.getElementById('view-home'), state, modalContainer, navigateTo));
      });
    }

    // Toggle checkboxes
    modalContainer.querySelectorAll('.custom-checkbox').forEach(chk => {
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        const tid = chk.dataset.chkId;
        state.toggleTaskStatus(tid);
        this.openQuickTasksSheet(modalContainer, state, navigateTo);
      });
    });

    // Task card edit
    modalContainer.querySelectorAll('.card-clickable').forEach(card => {
      card.addEventListener('click', () => {
        const tid = card.dataset.taskId;
        const t = state.getTaskById(tid);
        if (t) {
          closeSheet();
          TaskForm.open(modalContainer, state, t, () => this.render(document.getElementById('view-home'), state, modalContainer, navigateTo));
        }
      });
    });
  }
};
