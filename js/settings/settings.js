/**
 * ==========================================================================
 * SETTINGS VIEW CONTROLLER (APPLE HIG)
 * Themes, Data Export, Validated Import & Factory Reset
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Storage } from '../storage.js';
import { Utils } from '../utils.js';

export const SettingsModule = {
  render(containerEl, state, modalContainer, showToast = null) {
    containerEl.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'view-content';

    const currentTheme = state.settings?.theme || 'dark';

    wrapper.innerHTML = `
      <div class="section-header">
        <div>
          <h2 class="h2">Ajustes y Datos</h2>
          <p class="section-subtitle">Configuración general y respaldo de información</p>
        </div>
      </div>

      <!-- Theme Selector -->
      <div class="section-block">
        <h3 class="section-title" style="margin-bottom: 8px;">Aspecto Visual</h3>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-primary">Tema de la Aplicación</div>
              <div class="text-xs text-secondary">Alternar entre modo oscuro principal y modo claro</div>
            </div>
            <div class="segmented-control" style="max-width: 170px;">
              <button type="button" class="segmented-btn ${currentTheme === 'dark' ? 'active' : ''}" id="btn-theme-dark">Oscuro</button>
              <button type="button" class="segmented-btn ${currentTheme === 'light' ? 'active' : ''}" id="btn-theme-light">Claro</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Backup & Sync -->
      <div class="section-block">
        <h3 class="section-title" style="margin-bottom: 8px;">Copia de Seguridad y Restauración</h3>
        <div class="card" style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Export -->
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-primary">Exportar Datos</div>
              <div class="text-xs text-secondary">Descargar un archivo JSON con todas tus materias, horarios y notas</div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-data">
              ${Utils.getIcon('download', 14)}
              <span>Exportar</span>
            </button>
          </div>

          <div style="height: 1px; background-color: var(--border-subtle);"></div>

          <!-- Import -->
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-primary">Importar Datos</div>
              <div class="text-xs text-secondary">Cargar un archivo de respaldo JSON previamente exportado</div>
            </div>
            <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
              ${Utils.getIcon('upload', 14)}
              <span>Importar</span>
              <input type="file" id="file-import-input" accept=".json,application/json" class="sr-only" />
            </label>
          </div>
        </div>
      </div>

      <!-- Storage & Danger Zone -->
      <div class="section-block">
        <h3 class="section-title" style="margin-bottom: 8px; color: var(--color-danger);">Zona de Peligro</h3>
        <div class="card" style="border-color: var(--color-danger-border);">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-primary">Restablecer Datos</div>
              <div class="text-xs text-secondary">Elimina todos los datos guardados en el dispositivo</div>
            </div>
            <button type="button" class="btn btn-danger btn-sm" id="btn-wipe-data">
              ${Utils.getIcon('trash', 14)}
              <span>Eliminar Todo</span>
            </button>
          </div>
        </div>
      </div>

      <!-- App Info -->
      <div class="section-block" style="text-align: center; padding-top: 16px;">
        <div class="text-sm font-semibold text-primary">Agenda Semanal</div>
        <div class="text-xs text-muted" style="margin-top: 2px;">Versión Beta • Agenda Semanal</div>
        <div class="text-xs text-muted" style="margin-top: 4px;">Almacenamiento Local Offline • Optimizado para Android WebView</div>
      </div>
    `;

    // Theme Handlers
    wrapper.querySelector('#btn-theme-dark').addEventListener('click', () => {
      state.setTheme('dark');
      this.render(containerEl, state, modalContainer, showToast);
      if (showToast) showToast('Tema oscuro activado', 'success');
    });

    wrapper.querySelector('#btn-theme-light').addEventListener('click', () => {
      state.setTheme('light');
      this.render(containerEl, state, modalContainer, showToast);
      if (showToast) showToast('Tema claro activado', 'success');
    });

    // Export Handler
    wrapper.querySelector('#btn-export-data').addEventListener('click', () => {
      const jsonStr = Storage.exportJSON(state);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const nowStr = Utils.formatDateISO(new Date());
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `agenda-semanal-backup-${nowStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (showToast) showToast('Copia de seguridad descargada con éxito', 'success');
    });

    // Import Handler
    wrapper.querySelector('#file-import-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const validation = Storage.validateImportJSON(content);

        if (!validation.valid) {
          alert('Error al validar archivo: ' + validation.error);
          return;
        }

        // Confirmation Modal with counts
        modalContainer.innerHTML = `
          <div class="modal-overlay active" id="import-confirm-modal">
            <div class="modal-dialog" style="max-width: 460px;">
              <div class="modal-header">
                <h3 class="modal-title">Confirmar Importación</h3>
                <button type="button" class="modal-close-btn" id="btn-close-import">${Utils.getIcon('close', 14)}</button>
              </div>
              <div class="modal-body">
                <p class="text-sm text-primary" style="margin-bottom: 12px;">
                  Se validó el archivo de respaldo correctamente. Contiene:
                </p>
                <ul class="text-xs text-secondary" style="margin-bottom: 16px; list-style: disc; padding-left: 20px;">
                  <li><strong>${validation.counts.subjects}</strong> Materias</li>
                  <li><strong>${validation.counts.events}</strong> Eventos y Exámenes</li>
                  <li><strong>${validation.counts.tasks}</strong> Pendientes</li>
                </ul>
                <p class="text-xs text-danger" style="color: var(--color-warning);">
                  Al importar se reemplazarán los datos actuales por los del archivo. ¿Deseás continuar?
                </p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="btn-cancel-import">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-proceed-import">Reemplazar e Importar</button>
              </div>
            </div>
          </div>
        `;

        const overlay = modalContainer.querySelector('#import-confirm-modal');
        const closeImport = () => {
          overlay.classList.remove('active');
          setTimeout(() => { modalContainer.innerHTML = ''; }, 200);
        };

        modalContainer.querySelector('#btn-close-import').addEventListener('click', closeImport);
        modalContainer.querySelector('#btn-cancel-import').addEventListener('click', closeImport);

        modalContainer.querySelector('#btn-proceed-import').addEventListener('click', () => {
          state.importData(validation.data);
          closeImport();
          this.render(containerEl, state, modalContainer, showToast);
          if (showToast) showToast('Datos importados correctamente', 'success');
        });
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    // Wipe / Reset Handler
    wrapper.querySelector('#btn-wipe-data').addEventListener('click', () => {
      modalContainer.innerHTML = `
        <div class="modal-overlay active" id="wipe-confirm-modal">
          <div class="modal-dialog" style="max-width: 440px;">
            <div class="modal-header">
              <h3 class="modal-title" style="color: var(--color-danger);">Eliminar Todos los Datos</h3>
              <button type="button" class="modal-close-btn" id="btn-close-wipe">${Utils.getIcon('close', 14)}</button>
            </div>
            <div class="modal-body">
              <p class="text-sm text-primary" style="margin-bottom: 8px;">
                Esta acción eliminará permanentemente todas tus materias, calificaciones, horarios y pendientes de la memoria del dispositivo.
              </p>
              <p class="text-xs text-secondary">
                Se restablecerá la aplicación con datos de muestra iniciales. ¿Estás seguro?
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-wipe">Cancelar</button>
              <button type="button" class="btn btn-danger" id="btn-confirm-wipe">Eliminar Todo</button>
            </div>
          </div>
        </div>
      `;

      const overlay = modalContainer.querySelector('#wipe-confirm-modal');
      const closeWipe = () => {
        overlay.classList.remove('active');
        setTimeout(() => { modalContainer.innerHTML = ''; }, 200);
      };

      modalContainer.querySelector('#btn-close-wipe').addEventListener('click', closeWipe);
      modalContainer.querySelector('#btn-cancel-wipe').addEventListener('click', closeWipe);

      modalContainer.querySelector('#btn-confirm-wipe').addEventListener('click', () => {
        state.resetAllData();
        closeWipe();
        this.render(containerEl, state, modalContainer, showToast);
        if (showToast) showToast('Aplicación restablecida de fábrica', 'danger');
      });
    });

    containerEl.appendChild(wrapper);
  }
};
