/**
 * ==========================================================================
 * TASKS VIEW CONTROLLER (APPLE HIG)
 * Full Management of Academic Tasks & Pendientes
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';
import { TaskForm } from './task-form.js';

export const TasksModule = {
  currentFilter: 'all', // 'all' | 'pendiente' | 'en_progreso' | 'completado'

  render(containerEl, state, modalContainer) {
    containerEl.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'view-content';

    // Header Row
    const headerRow = document.createElement('div');
    headerRow.className = 'section-header';
    const pendingCount = state.tasks.filter(t => t.status !== 'completado').length;
    headerRow.innerHTML = `
      <div>
        <h2 class="h2">Pendientes</h2>
        <p class="section-subtitle">${pendingCount} activo(s) • ${state.tasks.length} total</p>
      </div>
      <button type="button" class="btn btn-primary" id="btn-add-task-top">
        ${Utils.getIcon('plus', 16)}
        <span>Nuevo Pendiente</span>
      </button>
    `;
    wrapper.appendChild(headerRow);

    headerRow.querySelector('#btn-add-task-top').addEventListener('click', () => {
      TaskForm.open(modalContainer, state, null, () => this.render(containerEl, state, modalContainer));
    });

    // Filter Chips
    const filtersRow = document.createElement('div');
    filtersRow.className = 'flex items-center gap-xs';
    filtersRow.style.overflowX = 'auto';
    filtersRow.style.paddingBottom = '10px';
    filtersRow.style.marginBottom = '8px';

    const filterOptions = [
      { id: 'all', label: 'Todos' },
      { id: 'examenes', label: 'Exámenes' },
      { id: 'pendiente', label: 'Pendientes' },
      { id: 'en_progreso', label: 'En Progreso' },
      { id: 'completado', label: 'Completados' }
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

    // If viewing Exámenes filter
    if (this.currentFilter === 'examenes') {
      const pendingExams = state.events
        .filter(e => (e.type === 'parcial' || e.type === 'final' || e.type === 'recuperatorio') && e.status !== 'completado')
        .sort((a, b) => new Date(a.date || '2099-01-01') - new Date(b.date || '2099-01-01'));

      if (pendingExams.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'card empty-state';
        empty.innerHTML = `
          <div class="empty-state-icon-wrap" style="color: var(--color-success);">${Utils.getIcon('check', 24)}</div>
          <div class="empty-state-title">No hay exámenes pendientes</div>
          <div class="empty-state-desc">¡Excelente! No tenés parciales ni finales por rendir en este momento.</div>
        `;
        wrapper.appendChild(empty);
      } else {
        const examListContainer = document.createElement('div');
        examListContainer.style.display = 'flex';
        examListContainer.style.flexDirection = 'column';
        examListContainer.style.gap = '10px';

        pendingExams.forEach(exam => {
          const sub = state.getSubjectById(exam.subjectId);
          const diff = Utils.daysDifference(exam.date, new Date());
          const isFinal = exam.type === 'final';
          const typeColor = isFinal ? '#ff453a' : '#ff375f';
          const typeLabel = isFinal ? 'Examen Final' : 'Parcial';

          let countdownLabel = `${diff} días`;
          let urgencyClass = 'approved';
          if (diff === 0) { countdownLabel = '¡Hoy!'; urgencyClass = 'failed'; }
          else if (diff === 1) { countdownLabel = 'Mañana'; urgencyClass = 'failed'; }
          else if (diff <= 7) { countdownLabel = `En ${diff} días`; urgencyClass = 'failed'; }
          else if (diff <= 15) { countdownLabel = `En ${diff} días`; urgencyClass = 'pending'; }

          const card = document.createElement('div');
          card.className = 'card card-clickable flex items-center justify-between';
          card.style.borderLeft = `4px solid ${typeColor}`;
          card.style.padding = '12px 14px';

          card.innerHTML = `
            <div style="flex: 1; min-width: 0;">
              <div class="flex items-center gap-xs" style="margin-bottom: 2px;">
                <span class="badge" style="background: ${typeColor}22; color: ${typeColor}; border: 1px solid ${typeColor}44; display: inline-flex; align-items: center; gap: 3px;">
                  ${Utils.getIcon(isFinal ? 'gradCap' : 'document', 11)}
                  <span>${typeLabel}</span>
                </span>
                <span class="font-bold text-primary truncate" style="font-size: 15px;">${Utils.escapeHTML(exam.title)}</span>
              </div>
              <div class="text-xs text-secondary truncate">
                ${sub ? `${Utils.escapeHTML(sub.name)} • ` : ''}Fecha: ${Utils.formatDateNatural(exam.date)} (${exam.startTime || '08:00'})
              </div>
              ${exam.description ? `<div class="text-xs text-muted truncate" style="margin-top: 2px;">${Utils.escapeHTML(exam.description)}</div>` : ''}
            </div>
            <span class="status-pill ${urgencyClass}" style="margin-left: 8px;">
              ${countdownLabel}
            </span>
          `;

          card.addEventListener('click', () => {
            // Dynamically import or open EventForm
            import('../events/event-form.js').then(({ EventForm }) => {
              EventForm.open(modalContainer, state, exam, {}, () => this.render(containerEl, state, modalContainer));
            });
          });

          examListContainer.appendChild(card);
        });

        wrapper.appendChild(examListContainer);
      }

      containerEl.appendChild(wrapper);
      return;
    }

    let tasks = [...state.tasks];
    if (this.currentFilter !== 'all') {
      tasks = tasks.filter(t => t.status === this.currentFilter);
    }

    tasks.sort((a, b) => {
      if (a.status === 'completado' && b.status !== 'completado') return 1;
      if (a.status !== 'completado' && b.status === 'completado') return -1;
      return new Date(a.dueDate || '2099-01-01') - new Date(b.dueDate || '2099-01-01');
    });

    if (tasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'card empty-state';
      empty.innerHTML = `
        <div class="empty-state-icon-wrap" style="color: var(--color-success);">${Utils.getIcon('check', 24)}</div>
        <div class="empty-state-title">No hay pendientes en esta vista</div>
        <div class="empty-state-desc">Mantené al día tus tareas, guías de ejercicios y lecturas de cada materia.</div>
        <button type="button" class="btn btn-primary btn-sm" id="btn-add-task-empty">
          ${Utils.getIcon('plus', 16)}
          <span>Agregar Pendiente</span>
        </button>
      `;
      empty.querySelector('#btn-add-task-empty').addEventListener('click', () => {
        TaskForm.open(modalContainer, state, null, () => this.render(containerEl, state, modalContainer));
      });
      wrapper.appendChild(empty);
    } else {
      const listContainer = document.createElement('div');
      listContainer.style.display = 'flex';
      listContainer.style.flexDirection = 'column';
      listContainer.style.gap = '8px';

      tasks.forEach(task => {
        const sub = state.getSubjectById(task.subjectId);
        const card = document.createElement('div');
        card.className = 'card card-clickable flex items-center justify-between';
        card.style.gap = '12px';

        const isDone = task.status === 'completado';
        const isInProgress = task.status === 'en_progreso';
        const priorityClass = task.priority === 'alta' ? 'priority-high' : task.priority === 'media' ? 'priority-med' : 'priority-low';

        card.innerHTML = `
          <button type="button" class="custom-checkbox ${isDone ? 'checked' : isInProgress ? 'in-progress' : ''}" data-task-id="${task.id}" aria-label="Cambiar estado de tarea">
            ${isDone ? Utils.getIcon('check', 12) : isInProgress ? '•' : ''}
          </button>

          <div style="flex: 1; min-width: 0; ${isDone ? 'opacity: 0.55; text-decoration: line-through;' : ''}">
            <div class="flex items-center gap-xs" style="margin-bottom: 2px;">
              <span class="priority-dot ${priorityClass}"></span>
              <h3 class="font-semibold text-primary truncate" style="font-size: 14px;">${Utils.escapeHTML(task.title)}</h3>
            </div>
            <div class="text-xs text-secondary truncate">
              ${sub ? `${Utils.escapeHTML(sub.name)} • ` : ''}Vence: ${Utils.formatDateShort(task.dueDate)}
            </div>
            ${task.description ? `<div class="text-xs text-muted truncate" style="margin-top: 2px;">${Utils.escapeHTML(task.description)}</div>` : ''}
          </div>

          <span class="status-pill ${isDone ? 'promoted' : isInProgress ? 'approved' : 'pending'}" style="font-size: 11px;">
            ${isDone ? 'Hecho' : isInProgress ? 'En curso' : 'Pendiente'}
          </span>
        `;

        card.querySelector('.custom-checkbox').addEventListener('click', (e) => {
          e.stopPropagation();
          state.toggleTaskStatus(task.id);
          this.render(containerEl, state, modalContainer);
        });

        card.addEventListener('click', () => {
          TaskForm.open(modalContainer, state, task, () => this.render(containerEl, state, modalContainer));
        });

        listContainer.appendChild(card);
      });

      wrapper.appendChild(listContainer);
    }

    containerEl.appendChild(wrapper);
  }
};
