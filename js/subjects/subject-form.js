/**
 * ==========================================================================
 * SUBJECT FORM MODAL
 * Dynamic Multi-Schedule Builder & Grade Cutoffs
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';

export const SubjectForm = {
  /**
   * Open Subject modal for creation or edit
   */
  open(modalContainer, state, subject = null, onSaved = null) {
    const isEdit = !!subject;
    const currentSubject = subject ? JSON.parse(JSON.stringify(subject)) : {
      name: '',
      professor: '',
      color: Utils.SUBJECT_COLORS[state.subjects.length % Utils.SUBJECT_COLORS.length],
      notes: '',
      minPassGrade: 4,
      minPromotionGrade: 7,
      schedules: [
        { dayIndex: 0, startTime: '08:00', endTime: '10:00', classroom: '' }
      ]
    };

    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="subject-modal-overlay">
        <div class="modal-dialog">
          <div class="modal-handle-bar"></div>
          <div class="modal-header">
            <h2 class="modal-title">${isEdit ? 'Editar Materia' : 'Nueva Materia'}</h2>
            <button type="button" class="modal-close-btn" id="btn-close-modal" aria-label="Cerrar">${Utils.getIcon('close', 14)}</button>
          </div>
          <div class="modal-body">
            <form id="subject-form" novalidate>
              <!-- Name -->
              <div class="form-group">
                <label class="form-label" for="subject-name">
                  Nombre de la Materia <span class="required-indicator">*</span>
                </label>
                <input 
                  type="text" 
                  id="subject-name" 
                  class="form-input" 
                  placeholder="Ej: Análisis Matemático II" 
                  value="${Utils.escapeHTML(currentSubject.name)}" 
                  required
                />
                <div class="form-error hidden" id="err-subject-name">El nombre es obligatorio.</div>
              </div>

              <!-- Professor -->
              <div class="form-group">
                <label class="form-label" for="subject-prof">Profesor / Cátedra</label>
                <input 
                  type="text" 
                  id="subject-prof" 
                  class="form-input" 
                  placeholder="Ej: Lic. Rossi" 
                  value="${Utils.escapeHTML(currentSubject.professor || '')}" 
                />
              </div>

              <!-- Color Palette -->
              <div class="form-group">
                <label class="form-label">Color Distintivo</label>
                <div class="color-picker-grid" id="color-picker">
                  ${Utils.SUBJECT_COLORS.map(c => `
                    <button 
                      type="button" 
                      class="color-swatch-btn ${currentSubject.color === c ? 'active' : ''}" 
                      style="background-color: ${c};" 
                      data-color="${c}"
                      aria-label="Seleccionar color ${c}"
                    ></button>
                  `).join('')}
                </div>
                <input type="hidden" id="selected-color" value="${currentSubject.color}" />
              </div>

              <!-- Grade Criteria -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="min-pass">Nota Mín. Aprobar</label>
                  <input 
                    type="number" 
                    id="min-pass" 
                    class="form-input" 
                    min="1" 
                    max="10" 
                    step="0.5" 
                    value="${currentSubject.minPassGrade || 4}" 
                  />
                  <span class="form-hint">Para regularizar o aprobar cursada</span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="min-promo">Nota Mín. Promoción</label>
                  <input 
                    type="number" 
                    id="min-promo" 
                    class="form-input" 
                    min="1" 
                    max="10" 
                    step="0.5" 
                    value="${currentSubject.minPromotionGrade || 7}" 
                  />
                  <span class="form-hint">Para promocionar directo</span>
                </div>
              </div>

              <!-- Notes / Extra Info -->
              <div class="form-group">
                <label class="form-label" for="subject-notes">Información Extra / Apuntes</label>
                <textarea 
                  id="subject-notes" 
                  class="form-textarea" 
                  placeholder="Ej: Aula 302, bibliografía, enlaces a campus..."
                >${Utils.escapeHTML(currentSubject.notes || '')}</textarea>
              </div>

              <!-- Schedules Multi-Builder -->
              <div class="form-group">
                <div class="flex items-center justify-between" style="margin-bottom: 8px;">
                  <label class="form-label" style="margin-bottom: 0;">Horarios Semanales de Cursada</label>
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-add-schedule">+ Agregar Horario</button>
                </div>
                <div class="schedule-list-builder" id="schedule-builder-list">
                  <!-- Dynamic schedule rows will be injected here -->
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            ${isEdit ? `<button type="button" class="btn btn-ghost-danger" id="btn-delete-subject" style="margin-right: auto;">Eliminar</button>` : ''}
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-save-subject">Guardar Materia</button>
          </div>
        </div>
      </div>
    `;

    const overlay = modalContainer.querySelector('#subject-modal-overlay');
    const scheduleContainer = modalContainer.querySelector('#schedule-builder-list');
    let schedulesList = Array.isArray(currentSubject.schedules) ? [...currentSubject.schedules] : [];

    // Helper to render schedules
    const renderSchedules = () => {
      scheduleContainer.innerHTML = '';
      if (schedulesList.length === 0) {
        scheduleContainer.innerHTML = `<div class="text-xs text-muted" style="padding: 8px 0;">No se definieron horarios para esta materia.</div>`;
        return;
      }

      schedulesList.forEach((sched, idx) => {
        const row = document.createElement('div');
        row.className = 'schedule-row-card';
        row.innerHTML = `
          <div class="schedule-row-header">
            <span class="schedule-row-title">Horario ${idx + 1}</span>
            <button type="button" class="btn btn-ghost-danger btn-sm" data-remove-idx="${idx}" style="padding: 2px 8px; min-height: 24px;">Eliminar</button>
          </div>
          <div class="schedule-grid-inputs">
            <div>
              <label class="text-xs text-muted" style="display: block; margin-bottom: 4px;">Día</label>
              <select class="form-select sched-day" data-idx="${idx}" style="min-height: 40px; padding: 6px 10px;">
                ${Utils.DAYS_FULL.map((dName, dIdx) => `
                  <option value="${dIdx}" ${parseInt(sched.dayIndex, 10) === dIdx ? 'selected' : ''}>${dName}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="text-xs text-muted" style="display: block; margin-bottom: 4px;">Aula / Espacio</label>
              <input type="text" class="form-input sched-room" data-idx="${idx}" placeholder="Ej: Aula 102" value="${Utils.escapeHTML(sched.classroom || '')}" style="min-height: 40px; padding: 6px 10px;" />
            </div>
            <div>
              <label class="text-xs text-muted" style="display: block; margin-bottom: 4px;">Inicio</label>
              <input type="time" class="form-input sched-start" data-idx="${idx}" value="${sched.startTime || '08:00'}" style="min-height: 40px; padding: 6px 10px;" />
            </div>
            <div>
              <label class="text-xs text-muted" style="display: block; margin-bottom: 4px;">Fin</label>
              <input type="time" class="form-input sched-end" data-idx="${idx}" value="${sched.endTime || '10:00'}" style="min-height: 40px; padding: 6px 10px;" />
            </div>
          </div>
        `;

        row.querySelector('[data-remove-idx]').addEventListener('click', () => {
          schedulesList.splice(idx, 1);
          renderSchedules();
        });

        row.querySelector('.sched-day').addEventListener('change', (e) => {
          schedulesList[idx].dayIndex = parseInt(e.target.value, 10);
        });

        row.querySelector('.sched-room').addEventListener('input', (e) => {
          schedulesList[idx].classroom = e.target.value;
        });

        row.querySelector('.sched-start').addEventListener('change', (e) => {
          schedulesList[idx].startTime = e.target.value;
        });

        row.querySelector('.sched-end').addEventListener('change', (e) => {
          schedulesList[idx].endTime = e.target.value;
        });

        scheduleContainer.appendChild(row);
      });
    };

    renderSchedules();

    // Add schedule button
    modalContainer.querySelector('#btn-add-schedule').addEventListener('click', () => {
      schedulesList.push({ dayIndex: 0, startTime: '08:00', endTime: '10:00', classroom: '' });
      renderSchedules();
    });

    // Color Swatch Selection
    const colorInput = modalContainer.querySelector('#selected-color');
    modalContainer.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalContainer.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        colorInput.value = btn.dataset.color;
      });
    });

    // Close / Cancel Handlers
    const closeModal = () => {
      overlay.classList.remove('active');
      setTimeout(() => { modalContainer.innerHTML = ''; }, 250);
    };

    modalContainer.querySelector('#btn-close-modal').addEventListener('click', closeModal);
    modalContainer.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Delete Handler
    if (isEdit) {
      modalContainer.querySelector('#btn-delete-subject').addEventListener('click', () => {
        if (confirm(`¿Estás seguro de que querés eliminar la materia "${subject.name}"? Los eventos asociados quedarán sin materia.`)) {
          state.deleteSubject(subject.id);
          closeModal();
          if (typeof onSaved === 'function') onSaved();
        }
      });
    }

    // Save Handler
    modalContainer.querySelector('#btn-save-subject').addEventListener('click', () => {
      const nameInput = modalContainer.querySelector('#subject-name');
      const errName = modalContainer.querySelector('#err-subject-name');

      if (!nameInput.value.trim()) {
        nameInput.focus();
        errName.classList.remove('hidden');
        return;
      }
      errName.classList.add('hidden');

      const payload = {
        name: nameInput.value.trim(),
        professor: modalContainer.querySelector('#subject-prof').value.trim(),
        color: colorInput.value,
        notes: modalContainer.querySelector('#subject-notes').value.trim(),
        minPassGrade: parseFloat(modalContainer.querySelector('#min-pass').value) || 4,
        minPromotionGrade: parseFloat(modalContainer.querySelector('#min-promo').value) || 7,
        schedules: schedulesList
      };

      if (isEdit) {
        state.updateSubject(subject.id, payload);
      } else {
        state.addSubject(payload);
      }

      closeModal();
      if (typeof onSaved === 'function') onSaved();
    });
  }
};
