/**
 * ==========================================================================
 * NOTIFICATIONS & INTERNAL ALERTS MODULE
 * Client-Side Academic Alert Engine with Early Study Reminders (Apple HIG)
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 *
 * Rules:
 * - Parciales: Early study reminder 1 week before (7 days).
 * - Finales: Early preparation alert 15 days to 1 month before (15-30 days).
 * - TPs / Entregas: 7 days to due date.
 * - Tasks: Today, tomorrow and high priority.
 */

import { Utils } from '../utils.js';

export const Notifications = {
  /**
   * Scan state for approaching exams, deadlines, and high priority tasks
   * Returns list of internal notices ordered by urgency
   */
  getUpcomingNotices(state, baseDate = new Date()) {
    const notices = [];
    const subjects = state.subjects || [];
    const events = state.events || [];
    const tasks = state.tasks || [];

    const getSubjectName = (subId) => {
      if (!subId) return null;
      const sub = subjects.find(s => s.id === subId);
      return sub ? sub.name : null;
    };

    // 1. Scan Events (Parciales, Finales, TPs, Entregas, Recuperatorios)
    events.forEach(event => {
      if (event.status === 'completado') return;
      if (!event.date) return;

      const diff = Utils.daysDifference(event.date, baseDate);
      if (diff === null || diff < 0) return;

      const subName = getSubjectName(event.subjectId);
      const subjectTag = subName ? ` de ${subName}` : '';
      let typeLabel = Utils.capitalize(event.type);
      if (event.type === 'tp') typeLabel = 'TP';

      let urgency = 'info';
      let title = '';
      let subtitle = '';
      let shouldInclude = false;
      let iconName = 'calendar';

      // --- EXAMEN FINAL (Alert 15 days - 1 month before) ---
      if (event.type === 'final') {
        iconName = 'gradCap';
        if (diff <= 30) {
          shouldInclude = true;
          if (diff === 0) {
            urgency = 'urgent';
            title = `¡Examen Final hoy!${subjectTag}`;
            subtitle = `${event.title} • Horario: ${event.startTime || 'Todo el día'}`;
          } else if (diff === 1) {
            urgency = 'urgent';
            title = `Examen Final es mañana${subjectTag}`;
            subtitle = `${event.title} • Preparación final para rendir`;
          } else if (diff < 7) {
            urgency = 'urgent';
            title = `Examen Final en ${diff} días${subjectTag}`;
            subtitle = `${event.title} • ${Utils.formatDateNatural(event.date)} (Repaso intensivo)`;
          } else if (diff < 15) {
            urgency = 'warning';
            title = `Examen Final en ${diff} días${subjectTag}`;
            subtitle = `${event.title} • Repaso integral de unidades y temas`;
          } else {
            urgency = 'info';
            const periodLabel = diff >= 28 ? '1 mes' : `${diff} días`;
            title = `Mesa de Final en ${periodLabel}${subjectTag}`;
            subtitle = `${event.title} • Planificá tu cronograma de estudio con anticipación`;
          }
        }
      } 
      // --- PARCIAL & RECUPERATORIO (Alert 1 week before) ---
      else if (event.type === 'parcial' || event.type === 'recuperatorio') {
        iconName = 'document';
        if (diff <= 7) {
          shouldInclude = true;
          if (diff === 0) {
            urgency = 'urgent';
            title = `¡Parcial hoy!${subjectTag}`;
            subtitle = `${event.title} • Horario: ${event.startTime || '08:00'}`;
          } else if (diff === 1) {
            urgency = 'warning';
            title = `Parcial es mañana${subjectTag}`;
            subtitle = `${event.title} • ¡Último repaso de temas!`;
          } else if (diff <= 3) {
            urgency = 'warning';
            title = `Parcial en ${diff} días${subjectTag}`;
            subtitle = `${event.title} • ${Utils.formatDateNatural(event.date)} (Estudio intensivo)`;
          } else if (diff === 7) {
            urgency = 'info';
            title = `Parcial en 1 semana${subjectTag}`;
            subtitle = `${event.title} • ¡Momento de comenzar a estudiar y repasar guías!`;
          } else {
            urgency = 'info';
            title = `Parcial en ${diff} días${subjectTag}`;
            subtitle = `${event.title} • ${Utils.formatDateNatural(event.date)} (Repaso de contenidos)`;
          }
        }
      } 
      // --- TPS, ENTREGAS Y OTROS (Alert within 7 days) ---
      else {
        if (diff <= 7) {
          shouldInclude = true;
          if (diff === 0) {
            urgency = 'urgent';
            title = `¡${typeLabel}${subjectTag} hoy!`;
            subtitle = `${event.title} • Horario: ${event.startTime || 'Todo el día'}`;
          } else if (diff === 1) {
            urgency = 'warning';
            title = `${typeLabel}${subjectTag} vence mañana`;
            subtitle = `${event.title} • ${Utils.formatDateShort(event.date)} (${event.startTime})`;
          } else {
            urgency = diff <= 3 ? 'warning' : 'info';
            title = `${typeLabel}${subjectTag} en ${diff} días`;
            subtitle = `${event.title} • ${Utils.formatDateNatural(event.date)}`;
          }
        }
      }

      if (shouldInclude) {
        notices.push({
          id: `ev-${event.id}`,
          type: 'event',
          eventType: event.type,
          entityId: event.id,
          urgency,
          diffDays: diff,
          title,
          subtitle,
          iconName
        });
      }
    });

    // 2. Scan Tasks / Pendientes with high priority or due within 2 days
    tasks.forEach(task => {
      if (task.status === 'completado') return;
      if (!task.dueDate) return;

      const diff = Utils.daysDifference(task.dueDate, baseDate);
      if (diff === null || diff < 0 || diff > 3) return;

      const subName = getSubjectName(task.subjectId);
      const subjectTag = subName ? ` (${subName})` : '';

      if (diff === 0) {
        notices.push({
          id: `task-${task.id}`,
          type: 'task',
          entityId: task.id,
          urgency: 'urgent',
          diffDays: diff,
          title: `Pendiente para hoy${subjectTag}`,
          subtitle: task.title,
          iconName: 'clock'
        });
      } else if (diff === 1 && task.priority === 'alta') {
        notices.push({
          id: `task-${task.id}`,
          type: 'task',
          entityId: task.id,
          urgency: 'warning',
          diffDays: diff,
          title: `Pendiente prioritario vence mañana${subjectTag}`,
          subtitle: task.title,
          iconName: 'warning'
        });
      }
    });

    // Sort by diffDays ascending, then urgency
    return notices.sort((a, b) => {
      if (a.diffDays !== b.diffDays) return a.diffDays - b.diffDays;
      const urgencyRank = { urgent: 0, warning: 1, info: 2 };
      return urgencyRank[a.urgency] - urgencyRank[b.urgency];
    });
  },

  /**
   * Open Apple-style Bottom Sheet displaying all active notices
   */
  openNoticesModal(modalContainer, state, onNoticeClick = null) {
    const notices = this.getUpcomingNotices(state);

    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="notices-modal-overlay">
        <div class="modal-dialog" style="max-width: 500px;">
          <div class="modal-handle-bar"></div>
          <div class="modal-header">
            <div class="flex items-center gap-xs">
              <div style="color: var(--color-accent);">${Utils.getIcon('bell', 20)}</div>
              <h2 class="modal-title">Avisos y Recordatorios de Estudio</h2>
            </div>
            <button type="button" class="modal-close-btn" id="btn-close-notices" aria-label="Cerrar">${Utils.getIcon('close', 14)}</button>
          </div>
          <div class="modal-body">
            ${notices.length === 0 ? `
              <div class="empty-state" style="padding: 32px 16px;">
                <div class="empty-state-icon-wrap">${Utils.getIcon('bell', 24)}</div>
                <div class="empty-state-title">No hay avisos pendientes</div>
                <div class="empty-state-desc">No tenés exámenes ni entregas urgentes programadas próximamente.</div>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${notices.map(n => `
                  <div class="notice-banner ${n.urgency}" data-notice-id="${n.id}" data-type="${n.type}" data-entity-id="${n.entityId}">
                    <div class="notice-icon-wrap">
                      ${Utils.getIcon(n.iconName, 18)}
                    </div>
                    <div class="notice-content">
                      <div class="notice-title">${Utils.escapeHTML(n.title)}</div>
                      <div class="notice-subtitle">${Utils.escapeHTML(n.subtitle)}</div>
                    </div>
                    <div style="color: var(--text-muted); align-self: center;">
                      ${Utils.getIcon('chevronRight', 16)}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    const overlay = modalContainer.querySelector('#notices-modal-overlay');
    const closeNotices = () => {
      overlay.classList.remove('active');
      setTimeout(() => { modalContainer.innerHTML = ''; }, 220);
    };

    modalContainer.querySelector('#btn-close-notices').addEventListener('click', closeNotices);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeNotices();
    });

    modalContainer.querySelectorAll('.notice-banner').forEach(item => {
      item.addEventListener('click', () => {
        const type = item.dataset.type;
        const entityId = item.dataset.entityId;
        closeNotices();
        if (typeof onNoticeClick === 'function') {
          onNoticeClick({ type, entityId });
        }
      });
    });
  }
};
