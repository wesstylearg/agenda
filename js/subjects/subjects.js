/**
 * ==========================================================================
 * SUBJECTS VIEW CONTROLLER (APPLE HIG)
 * Full CRUD display for Academic Subjects
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';
import { SubjectForm } from './subject-form.js';

export const SubjectsModule = {
  render(containerEl, state, modalContainer) {
    containerEl.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'view-content';

    // Header & Add Button
    const headerRow = document.createElement('div');
    headerRow.className = 'section-header';
    headerRow.innerHTML = `
      <div>
        <h2 class="h2">Materias</h2>
        <p class="section-subtitle">${state.subjects.length} materia(s) registradas</p>
      </div>
      <button type="button" class="btn btn-primary" id="btn-add-subject-top">
        ${Utils.getIcon('plus', 16)}
        <span>Nueva Materia</span>
      </button>
    `;
    wrapper.appendChild(headerRow);

    headerRow.querySelector('#btn-add-subject-top').addEventListener('click', () => {
      SubjectForm.open(modalContainer, state, null, () => this.render(containerEl, state, modalContainer));
    });

    // List of subjects
    if (state.subjects.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'card empty-state';
      empty.innerHTML = `
        <div class="empty-state-icon-wrap">${Utils.getIcon('book', 24)}</div>
        <div class="empty-state-title">No tenés materias cargadas</div>
        <div class="empty-state-desc">Agregá tus materias del cuatrimestre con sus respectivos días y horarios de cursada.</div>
        <button type="button" class="btn btn-primary" id="btn-add-subject-empty">
          ${Utils.getIcon('plus', 16)}
          <span>Agregar Materia</span>
        </button>
      `;
      empty.querySelector('#btn-add-subject-empty').addEventListener('click', () => {
        SubjectForm.open(modalContainer, state, null, () => this.render(containerEl, state, modalContainer));
      });
      wrapper.appendChild(empty);
    } else {
      const listContainer = document.createElement('div');
      listContainer.style.display = 'flex';
      listContainer.style.flexDirection = 'column';
      listContainer.style.gap = '10px';

      state.subjects.forEach(subject => {
        const card = document.createElement('div');
        card.className = 'card card-clickable';
        card.style.borderLeft = `4px solid ${subject.color || 'var(--color-accent)'}`;

        const schedulesHTML = (subject.schedules && subject.schedules.length > 0)
          ? subject.schedules.map(s => `
              <span class="badge" style="background: var(--bg-surface-raised); color: var(--text-secondary); border: 1px solid var(--border-subtle);">
                ${Utils.DAYS_SHORT[s.dayIndex]} ${Utils.escapeHTML(s.startTime)}–${Utils.escapeHTML(s.endTime)}${s.classroom ? ` (${Utils.escapeHTML(s.classroom)})` : ''}
              </span>
            `).join(' ')
          : '<span class="text-xs text-muted">Sin horarios asignados</span>';

        card.innerHTML = `
          <div class="flex items-center justify-between" style="margin-bottom: 4px;">
            <h3 class="h3 truncate" style="color: var(--text-primary); font-size: 16px;">${Utils.escapeHTML(subject.name)}</h3>
            <span class="text-xs text-muted">Aprobar: ${subject.minPassGrade} | Promo: ${subject.minPromotionGrade}</span>
          </div>
          ${subject.professor ? `<div class="text-xs text-secondary" style="margin-bottom: 6px;">Prof. ${Utils.escapeHTML(subject.professor)}</div>` : ''}
          <div class="flex items-center gap-xs" style="flex-wrap: wrap; margin-bottom: 6px;">
            ${schedulesHTML}
          </div>
          ${subject.notes ? `<div class="text-xs text-muted truncate">${Utils.escapeHTML(subject.notes)}</div>` : ''}
        `;

        card.addEventListener('click', () => {
          SubjectForm.open(modalContainer, state, subject, () => this.render(containerEl, state, modalContainer));
        });

        listContainer.appendChild(card);
      });

      wrapper.appendChild(listContainer);
    }

    containerEl.appendChild(wrapper);
  }
};
