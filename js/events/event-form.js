/**
 * ==========================================================================
 * EVENT FORM MODAL
 * Form for Exams, Assignments, Finals, and Academic Milestones
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';

export const EventForm = {
  /**
   * Open Event Modal for creation or edit
   */
  open(modalContainer, state, event = null, initialDefaults = {}, onSaved = null) {
    const isEdit = !!event;
    const currentEvent = event ? JSON.parse(JSON.stringify(event)) : {
      title: '',
      subjectId: initialDefaults.subjectId || (state.subjects.length > 0 ? state.subjects[0].id : ''),
      type: initialDefaults.type || 'parcial',
      date: initialDefaults.date || Utils.formatDateISO(new Date()),
      startTime: initialDefaults.startTime || '08:00',
      endTime: initialDefaults.endTime || '10:00',
      description: '',
      priority: 'alta',
      status: 'pendiente',
      grade: null
    };

    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="event-modal-overlay">
        <div class="modal-dialog">
          <div class="modal-handle-bar"></div>
          <div class="modal-header">
            <h2 class="modal-title">${isEdit ? 'Editar Evento' : 'Nuevo Evento Académico'}</h2>
            <button type="button" class="modal-close-btn" id="btn-close-modal" aria-label="Cerrar">${Utils.getIcon('close', 14)}</button>
          </div>
          <div class="modal-body">
            <form id="event-form" novalidate>
              <!-- Title -->
              <div class="form-group">
                <label class="form-label" for="event-title">
                  Título del Evento <span class="required-indicator">*</span>
                </label>
                <input 
                  type="text" 
                  id="event-title" 
                  class="form-input" 
                  placeholder="Ej: Primer Parcial, Entrega TP 2..." 
                  value="${Utils.escapeHTML(currentEvent.title)}" 
                  required
                />
                <div class="form-error hidden" id="err-event-title">El título es obligatorio.</div>
              </div>

              <!-- Type and Subject -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="event-type">Tipo</label>
                  <select id="event-type" class="form-select">
                    <option value="parcial" ${currentEvent.type === 'parcial' ? 'selected' : ''}>Parcial</option>
                    <option value="tp" ${currentEvent.type === 'tp' ? 'selected' : ''}>Trabajo Práctico (TP)</option>
                    <option value="entrega" ${currentEvent.type === 'entrega' ? 'selected' : ''}>Entrega</option>
                    <option value="final" ${currentEvent.type === 'final' ? 'selected' : ''}>Examen Final</option>
                    <option value="recuperatorio" ${currentEvent.type === 'recuperatorio' ? 'selected' : ''}>Recuperatorio</option>
                    <option value="otro" ${currentEvent.type === 'otro' ? 'selected' : ''}>Otro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="event-subject">Materia</label>
                  <select id="event-subject" class="form-select">
                    <option value="">(Sin materia / Libre)</option>
                    ${state.subjects.map(s => `
                      <option value="${s.id}" ${currentEvent.subjectId === s.id ? 'selected' : ''}>${Utils.escapeHTML(s.name)}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <!-- Date and Times -->
              <div class="form-group">
                <label class="form-label" for="event-date">Fecha</label>
                <input 
                  type="date" 
                  id="event-date" 
                  class="form-input" 
                  value="${currentEvent.date}" 
                  required
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="event-start">Hora Inicio</label>
                  <input 
                    type="time" 
                    id="event-start" 
                    class="form-input" 
                    value="${currentEvent.startTime}" 
                  />
                </div>
                <div class="form-group">
                  <label class="form-label" for="event-end">Hora Fin</label>
                  <input 
                    type="time" 
                    id="event-end" 
                    class="form-input" 
                    value="${currentEvent.endTime}" 
                  />
                </div>
              </div>

              <!-- Priority and Status -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="event-priority">Prioridad</label>
                  <select id="event-priority" class="form-select">
                    <option value="alta" ${currentEvent.priority === 'alta' ? 'selected' : ''}>Alta</option>
                    <option value="media" ${currentEvent.priority === 'media' ? 'selected' : ''}>Media</option>
                    <option value="baja" ${currentEvent.priority === 'baja' ? 'selected' : ''}>Baja</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="event-status">Estado</label>
                  <select id="event-status" class="form-select">
                    <option value="pendiente" ${currentEvent.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="en_progreso" ${currentEvent.status === 'en_progreso' ? 'selected' : ''}>En Progreso</option>
                    <option value="completado" ${currentEvent.status === 'completado' ? 'selected' : ''}>Completado / Rendido</option>
                  </select>
                </div>
              </div>

              <!-- Grade / Calificación -->
              <div class="form-group">
                <label class="form-label" for="event-grade">
                  Nota / Calificación (Opcional)
                </label>
                <input 
                  type="number" 
                  id="event-grade" 
                  class="form-input" 
                  min="1" 
                  max="10" 
                  step="0.1" 
                  placeholder="Ej: 8.5"
                  value="${currentEvent.grade !== null && currentEvent.grade !== undefined ? currentEvent.grade : ''}" 
                />
                <span class="form-hint">
                  Nota: Solo los <strong>parciales</strong> con nota suman al promedio de cursada. Los <strong>finales</strong> con nota ≥ 4 aprueban la materia.
                </span>
              </div>

              <!-- Description -->
              <div class="form-group">
                <label class="form-label" for="event-desc">Temario / Descripción</label>
                <textarea 
                  id="event-desc" 
                  class="form-textarea" 
                  placeholder="Ej: Temas incluidos, aula asignada, material permitido..."
                >${Utils.escapeHTML(currentEvent.description || '')}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            ${isEdit ? `<button type="button" class="btn btn-ghost-danger" id="btn-delete-event" style="margin-right: auto;">Eliminar</button>` : ''}
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-save-event">Guardar Evento</button>
          </div>
        </div>
      </div>
    `;

    const overlay = modalContainer.querySelector('#event-modal-overlay');

    const closeModal = () => {
      overlay.classList.remove('active');
      setTimeout(() => { modalContainer.innerHTML = ''; }, 250);
    };

    modalContainer.querySelector('#btn-close-modal').addEventListener('click', closeModal);
    modalContainer.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    if (isEdit) {
      modalContainer.querySelector('#btn-delete-event').addEventListener('click', () => {
        if (confirm(`¿Estás seguro de que querés eliminar el evento "${event.title}"?`)) {
          state.deleteEvent(event.id);
          closeModal();
          if (typeof onSaved === 'function') onSaved();
        }
      });
    }

    modalContainer.querySelector('#btn-save-event').addEventListener('click', () => {
      const titleInput = modalContainer.querySelector('#event-title');
      const errTitle = modalContainer.querySelector('#err-event-title');

      if (!titleInput.value.trim()) {
        titleInput.focus();
        errTitle.classList.remove('hidden');
        return;
      }
      errTitle.classList.add('hidden');

      const rawGrade = modalContainer.querySelector('#event-grade').value.trim();

      const payload = {
        title: titleInput.value.trim(),
        subjectId: modalContainer.querySelector('#event-subject').value || null,
        type: modalContainer.querySelector('#event-type').value,
        date: modalContainer.querySelector('#event-date').value,
        startTime: modalContainer.querySelector('#event-start').value || '08:00',
        endTime: modalContainer.querySelector('#event-end').value || '10:00',
        priority: modalContainer.querySelector('#event-priority').value,
        status: modalContainer.querySelector('#event-status').value,
        grade: rawGrade !== '' ? parseFloat(rawGrade) : null,
        description: modalContainer.querySelector('#event-desc').value.trim()
      };

      if (isEdit) {
        state.updateEvent(event.id, payload);
      } else {
        state.addEvent(payload);
      }

      closeModal();
      if (typeof onSaved === 'function') onSaved();
    });
  }
};
