/**
 * ==========================================================================
 * MORE VIEW (MÁS) CONTROLLER & SUB-SCREENS HUB (APPLE HIG)
 * Manages Materias, Pendientes, Notas, Estadísticas, Ajustes
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';
import { SubjectsModule } from '../subjects/subjects.js';
import { TasksModule } from '../tasks/tasks.js';
import { GradesModule } from '../grades/grades.js';
import { GradeCalculator } from '../grades/grade-calculator.js';
import { SettingsModule } from '../settings/settings.js';

export const MoreView = {
  currentSubView: null, // null (Hub) | 'subjects' | 'tasks' | 'grades' | 'stats' | 'settings'

  render(containerEl, state, modalContainer, showToast = null) {
    containerEl.innerHTML = '';

    if (!this.currentSubView) {
      this.renderHub(containerEl, state, modalContainer, showToast);
    } else {
      this.renderSubScreen(containerEl, state, modalContainer, showToast);
    }
  },

  renderHub(containerEl, state, modalContainer, showToast) {
    const wrapper = document.createElement('div');
    wrapper.className = 'view-content';

    const globalStats = GradeCalculator.calculateGlobalStats(state.subjects, state.events);
    const activeTasksCount = state.tasks.filter(t => t.status !== 'completado').length;

    wrapper.innerHTML = `
      <div class="section-header" style="margin-bottom: 20px; padding-top: 4px;">
        <div>
          <h1 class="h1">Más Opciones</h1>
          <p class="section-subtitle">Gestión integral académica y herramientas</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <!-- Materias -->
        <div class="card card-clickable flex items-center justify-between" id="nav-more-subjects" style="padding: 16px;">
          <div class="flex items-center gap-md">
            <div class="notice-icon-wrap" style="background: rgba(94, 92, 230, 0.15); color: var(--color-accent);">
              ${Utils.getIcon('book', 20)}
            </div>
            <div>
              <div class="font-semibold text-primary">Materias y Horarios</div>
              <div class="text-xs text-secondary">Cátedras, comisiones, aulas y criterios de regularidad</div>
            </div>
          </div>
          <div class="flex items-center gap-xs">
            <span class="badge" style="background: var(--bg-surface-raised); color: var(--text-secondary);">${state.subjects.length}</span>
            <span style="color: var(--text-muted);">${Utils.getIcon('chevronRight', 16)}</span>
          </div>
        </div>

        <!-- Pendientes -->
        <div class="card card-clickable flex items-center justify-between" id="nav-more-tasks" style="padding: 16px;">
          <div class="flex items-center gap-md">
            <div class="notice-icon-wrap" style="background: rgba(255, 159, 10, 0.15); color: var(--color-warning);">
              ${Utils.getIcon('clock', 20)}
            </div>
            <div>
              <div class="font-semibold text-primary">Lista de Pendientes</div>
              <div class="text-xs text-secondary">Tareas, ejercicios, lecturas y entregas pendientes</div>
            </div>
          </div>
          <div class="flex items-center gap-xs">
            <span class="badge" style="background: var(--bg-surface-raised); color: var(--color-warning);">${activeTasksCount} activos</span>
            <span style="color: var(--text-muted);">${Utils.getIcon('chevronRight', 16)}</span>
          </div>
        </div>

        <!-- Notas y Calificaciones -->
        <div class="card card-clickable flex items-center justify-between" id="nav-more-grades" style="padding: 16px;">
          <div class="flex items-center gap-md">
            <div class="notice-icon-wrap" style="background: rgba(48, 209, 88, 0.15); color: var(--color-success);">
              ${Utils.getIcon('gradCap', 20)}
            </div>
            <div>
              <div class="font-semibold text-primary">Notas y Calificaciones</div>
              <div class="text-xs text-secondary">Promedios de cursada, promociones y exámenes finales</div>
            </div>
          </div>
          <div class="flex items-center gap-xs">
            ${globalStats.globalAverage !== null ? `<span class="status-pill promoted" style="font-size: 11px;">Prom: ${globalStats.globalAverage}</span>` : ''}
            <span style="color: var(--text-muted);">${Utils.getIcon('chevronRight', 16)}</span>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="card card-clickable flex items-center justify-between" id="nav-more-stats" style="padding: 16px;">
          <div class="flex items-center gap-md">
            <div class="notice-icon-wrap" style="background: rgba(10, 132, 255, 0.15); color: var(--color-info);">
              ${Utils.getIcon('stats', 20)}
            </div>
            <div>
              <div class="font-semibold text-primary">Estadísticas Académicas</div>
              <div class="text-xs text-secondary">Resumen de avance, rendimiento y métricas clave</div>
            </div>
          </div>
          <span style="color: var(--text-muted);">${Utils.getIcon('chevronRight', 16)}</span>
        </div>

        <!-- Ajustes -->
        <div class="card card-clickable flex items-center justify-between" id="nav-more-settings" style="padding: 16px;">
          <div class="flex items-center gap-md">
            <div class="notice-icon-wrap" style="background: rgba(142, 142, 147, 0.15); color: var(--text-secondary);">
              ${Utils.getIcon('settings', 20)}
            </div>
            <div>
              <div class="font-semibold text-primary">Ajustes y Datos</div>
              <div class="text-xs text-secondary">Tema oscuro/claro, exportar respaldo y restaurar</div>
            </div>
          </div>
          <span style="color: var(--text-muted);">${Utils.getIcon('chevronRight', 16)}</span>
        </div>
      </div>
    `;

    wrapper.querySelector('#nav-more-subjects').addEventListener('click', () => {
      this.currentSubView = 'subjects';
      this.render(containerEl, state, modalContainer, showToast);
    });

    wrapper.querySelector('#nav-more-tasks').addEventListener('click', () => {
      this.currentSubView = 'tasks';
      this.render(containerEl, state, modalContainer, showToast);
    });

    wrapper.querySelector('#nav-more-grades').addEventListener('click', () => {
      this.currentSubView = 'grades';
      this.render(containerEl, state, modalContainer, showToast);
    });

    wrapper.querySelector('#nav-more-stats').addEventListener('click', () => {
      this.currentSubView = 'stats';
      this.render(containerEl, state, modalContainer, showToast);
    });

    wrapper.querySelector('#nav-more-settings').addEventListener('click', () => {
      this.currentSubView = 'settings';
      this.render(containerEl, state, modalContainer, showToast);
    });

    containerEl.appendChild(wrapper);
  },

  renderSubScreen(containerEl, state, modalContainer, showToast) {
    const subContainer = document.createElement('div');
    subContainer.style.display = 'flex';
    subContainer.style.flexDirection = 'column';
    subContainer.style.height = '100%';
    subContainer.style.width = '100%';

    // Sub-Screen Header with Back Button
    const backHeader = document.createElement('div');
    backHeader.className = 'app-header';
    backHeader.innerHTML = `
      <button type="button" class="btn btn-ghost btn-sm" id="btn-back-more" style="gap: 4px; padding-left: 0;">
        ${Utils.getIcon('chevronLeft', 16)}
        <span>Volver</span>
      </button>
      <div class="font-semibold text-primary text-sm" id="subscreen-title"></div>
      <div style="width: 60px;"></div>
    `;

    backHeader.querySelector('#btn-back-more').addEventListener('click', () => {
      this.currentSubView = null;
      this.render(containerEl, state, modalContainer, showToast);
    });

    subContainer.appendChild(backHeader);

    const contentArea = document.createElement('div');
    contentArea.style.flex = '1';
    contentArea.style.overflow = 'hidden';
    contentArea.style.display = 'flex';
    contentArea.style.flexDirection = 'column';

    const titleEl = backHeader.querySelector('#subscreen-title');

    if (this.currentSubView === 'subjects') {
      titleEl.textContent = 'Materias';
      SubjectsModule.render(contentArea, state, modalContainer);
    } else if (this.currentSubView === 'tasks') {
      titleEl.textContent = 'Pendientes';
      TasksModule.render(contentArea, state, modalContainer);
    } else if (this.currentSubView === 'grades') {
      titleEl.textContent = 'Calificaciones';
      GradesModule.render(contentArea, state, modalContainer);
    } else if (this.currentSubView === 'stats') {
      titleEl.textContent = 'Estadísticas';
      this.renderStatsView(contentArea, state);
    } else if (this.currentSubView === 'settings') {
      titleEl.textContent = 'Ajustes';
      SettingsModule.render(contentArea, state, modalContainer, showToast);
    }

    subContainer.appendChild(contentArea);
    containerEl.appendChild(subContainer);
  },

  renderStatsView(containerEl, state) {
    const wrapper = document.createElement('div');
    wrapper.className = 'view-content';

    const stats = GradeCalculator.calculateGlobalStats(state.subjects, state.events);
    const activeTasks = state.tasks.filter(t => t.status !== 'completado').length;
    const completedTasks = state.tasks.filter(t => t.status === 'completado').length;

    const upcomingEventsCount = state.events.filter(e => {
      const diff = Utils.daysDifference(e.date, new Date());
      return diff !== null && diff >= 0 && diff <= 14;
    }).length;

    wrapper.innerHTML = `
      <div class="section-header">
        <div>
          <h2 class="h2">Estadísticas Académicas</h2>
          <p class="section-subtitle">Métricas clave de rendimiento y avance</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value text-accent">${stats.totalSubjects}</div>
          <div class="stat-label">Materias Totales</div>
        </div>
        <div class="stat-card">
          <div class="stat-value text-accent">${stats.globalAverage !== null ? stats.globalAverage : '—'}</div>
          <div class="stat-label">Promedio General</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-success);">${stats.countPromoted}</div>
          <div class="stat-label">Promocionadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-info);">${stats.countApproved}</div>
          <div class="stat-label">Aprobadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-danger);">${stats.countFailed}</div>
          <div class="stat-label">Desaprobadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-warning);">${upcomingEventsCount}</div>
          <div class="stat-label">Próximos Eventos (14d)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-warning);">${activeTasks}</div>
          <div class="stat-label">Pendientes Activos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--color-success);">${completedTasks}</div>
          <div class="stat-label">Tareas Completadas</div>
        </div>
      </div>
    `;

    containerEl.appendChild(wrapper);
  }
};
