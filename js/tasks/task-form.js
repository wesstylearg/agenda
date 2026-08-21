/**
 * ==========================================================================
 * TASK FORM MODAL
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';

export const TaskForm = {
  /**
   * Open Task Modal for creation or edit
   */
  open(modalContainer, state, task = null, onSaved = null) {
    const isEdit = !!task;
    const currentTask = task ? JSON.parse(JSON.stringify(task)) : {
      title: '',
      subjectId: state.subjects.length > 0 ? state.subjects[0].id : '',
      dueDate: Utils.formatDateISO(new Date()),
      priority: 'media',
      description: '',
      status: 'pendiente'
    };

    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="task-modal-overlay">
        <div class="modal-dialog">
          <div class="modal-handle-bar"></div>
          <div class="modal-header">
            <h2 class="modal-title">${isEdit ? 'Editar Pendiente' : 'Nuevo Pendiente'}</h2>
            <button type="button" class="modal-close-btn" id="btn-close-modal" aria-label="Cerrar">${Utils.getIcon('close', 14)}</button>
          </div>
          <div class="modal-body">
            <form id="task-form" novalidate>
              <!-- Title -->
              <div class="form-group">
                <label class="form-label" for="task-title">
                  Tarea / Pendiente <span class="required-indicator">*</span>
                </label>
                <input 
                  type="text" 
                  id="task-title" 
                  class="form-input" 
                  placeholder="Ej: Repasar guía 3, preparar informe..." 
                  value="${Utils.escapeHTML(currentTask.title)}" 
                  required
                />
                <div class="form-error hidden" id="err-task-title">La descripción es obligatoria.</div>
              </div>

              <!-- Subject and Priority -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="task-subject">Materia</label>
                  <select id="task-subject" class="form-select">
                    <option value="">(General / Sin materia)</option>
                    ${state.subjects.map(s => `
                      <option value="${s.id}" ${currentTask.subjectId === s.id ? 'selected' : ''}>${Utils.escapeHTML(s.name)}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="task-priority">Prioridad</label>
                  <select id="task-priority" class="form-select">
                    <option value="alta" ${currentTask.priority === 'alta' ? 'selected' : ''}>Alta</option>
                    <option value="media" ${currentTask.priority === 'media' ? 'selected' : ''}>Media</option>
                    <option value="baja" ${currentTask.priority === 'baja' ? 'selected' : ''}>Baja</option>
                  </select>
                </div>
              </div>

              <!-- Due Date and Status -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="task-date">Fecha Límite</label>
                  <input 
                    type="date" 
                    id="task-date" 
                    class="form-input" 
                    value="${currentTask.dueDate}" 
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label" for="task-status">Estado</label>
                  <select id="task-status" class="form-select">
                    <option value="pendiente" ${currentTask.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="en_progreso" ${currentTask.status === 'en_progreso' ? 'selected' : ''}>En Progreso</option>
                    <option value="completado" ${currentTask.status === 'completado' ? 'selected' : ''}>Completado</option>
                  </select>
                </div>
              </div>

              <!-- Description / Notes -->
              <div class="form-group">
                <label class="form-label" for="task-desc">Detalles Adicionales</label>
                <textarea 
                  id="task-desc" 
                  class="form-textarea" 
                  placeholder="Ej: Páginas del libro, instrucciones específicas..."
                >${Utils.escapeHTML(currentTask.description || '')}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            ${isEdit ? `<button type="button" class="btn btn-ghost-danger" id="btn-delete-task" style="margin-right: auto;">Eliminar</button>` : ''}
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-save-task">Guardar Pendiente</button>
          </div>
        </div>
      </div>
    `;

    const overlay = modalContainer.querySelector('#task-modal-overlay');

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
      modalContainer.querySelector('#btn-delete-task').addEventListener('click', () => {
        if (confirm(`¿Eliminar este pendiente?`)) {
          state.deleteTask(task.id);
          closeModal();
          if (typeof onSaved === 'function') onSaved();
        }
      });
    }

    modalContainer.querySelector('#btn-save-task').addEventListener('click', () => {
      const titleInput = modalContainer.querySelector('#task-title');
      const errTitle = modalContainer.querySelector('#err-task-title');

      if (!titleInput.value.trim()) {
        titleInput.focus();
        errTitle.classList.remove('hidden');
        return;
      }
      errTitle.classList.add('hidden');

      const payload = {
        title: titleInput.value.trim(),
        subjectId: modalContainer.querySelector('#task-subject').value || null,
        priority: modalContainer.querySelector('#task-priority').value,
        dueDate: modalContainer.querySelector('#task-date').value,
        status: modalContainer.querySelector('#task-status').value,
        description: modalContainer.querySelector('#task-desc').value.trim()
      };

      if (isEdit) {
        state.updateTask(task.id, payload);
      } else {
        state.addTask(payload);
      }

      closeModal();
      if (typeof onSaved === 'function') onSaved();
    });
  }
};
