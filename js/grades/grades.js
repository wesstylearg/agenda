/**
 * ==========================================================================
 * GRADES VIEW CONTROLLER (APPLE HIG)
 * Academic Standing, Averages & Exam Grades Evaluation
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';
import { GradeCalculator } from './grade-calculator.js';
import { EventForm } from '../events/event-form.js';

export const GradesModule = {
  render(containerEl, state, modalContainer) {
    containerEl.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'view-content';

    const stats = GradeCalculator.calculateGlobalStats(state.subjects, state.events);
    const independentFinals = GradeCalculator.getIndependentFinals(state.events);

    // Header & Summary Stats
    const headerRow = document.createElement('div');
    headerRow.className = 'section-header';
    headerRow.innerHTML = `
      <div>
        <h2 class="h2">Calificaciones Académicas</h2>
        <p class="section-subtitle">Cálculo de promedios, regularidades y finales</p>
      </div>
    `;
    wrapper.appendChild(headerRow);

    // Summary Scoreboard
    const statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid';
    statsGrid.innerHTML = `
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
        <div class="stat-label">Aprobadas (Cursada)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--color-danger);">${stats.countFailed}</div>
        <div class="stat-label">Desaprobadas</div>
      </div>
    `;
    wrapper.appendChild(statsGrid);

    // Academic Rules Note Banner
    const infoCard = document.createElement('div');
    infoCard.className = 'card';
    infoCard.style.marginBottom = '20px';
    infoCard.style.backgroundColor = 'var(--bg-surface-raised)';
    infoCard.innerHTML = `
      <div class="flex items-center gap-xs font-semibold text-primary text-xs" style="margin-bottom: 4px;">
        <span style="color: var(--color-accent);">${Utils.getIcon('info', 14)}</span>
        <span>Criterio de Evaluación Académica</span>
      </div>
      <p class="text-xs text-secondary">
        El promedio de cada materia se calcula <strong>únicamente con exámenes parciales</strong> con nota. Los finales (aprobación fija con nota ≥ 4), TPs y recuperatorios no afectan el promedio de cursada.
      </p>
    `;
    wrapper.appendChild(infoCard);

    // Subjects Grade Cards
    const listTitle = document.createElement('h3');
    listTitle.className = 'section-title';
    listTitle.style.marginBottom = '12px';
    listTitle.textContent = 'Detalle por Materia';
    wrapper.appendChild(listTitle);

    if (state.subjects.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'card empty-state';
      empty.innerHTML = `
        <div class="empty-state-icon-wrap">${Utils.getIcon('gradCap', 24)}</div>
        <div class="empty-state-title">No hay materias para calificar</div>
        <div class="empty-state-desc">Creá materias y asignales parciales con nota para visualizar los promedios.</div>
      `;
      wrapper.appendChild(empty);
    } else {
      const subjectCardsContainer = document.createElement('div');
      subjectCardsContainer.style.display = 'flex';
      subjectCardsContainer.style.flexDirection = 'column';
      subjectCardsContainer.style.gap = '12px';

      stats.subjectResults.forEach(subRes => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.borderLeft = `4px solid ${subRes.subjectColor || 'var(--color-accent)'}`;

        const statusClass = subRes.academicStatus === 'promocionado' ? 'promoted' 
          : subRes.academicStatus === 'aprobado' ? 'approved' 
          : subRes.academicStatus === 'desaprobado' ? 'failed' 
          : 'pending';

        // Render Partial items
        let partialsHTML = '';
        if (subRes.gradedPartials.length === 0) {
          partialsHTML = `<div class="text-xs text-muted">Sin parciales calificados aún.</div>`;
        } else {
          partialsHTML = `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${subRes.gradedPartials.map(p => `
                <div class="flex items-center justify-between text-xs" style="padding: 6px 10px; background: var(--bg-surface-raised); border-radius: var(--radius-sm);">
                  <span class="text-secondary">${Utils.escapeHTML(p.title)}</span>
                  <span class="font-bold text-primary" style="font-size: 13px;">${p.grade}</span>
                </div>
              `).join('')}
            </div>
          `;
        }

        // Render Finals items
        let finalsHTML = '';
        if (subRes.finals && subRes.finals.length > 0) {
          finalsHTML = `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border-subtle);">
              <div class="text-xs font-semibold text-muted" style="margin-bottom: 6px; text-transform: uppercase;">Examen Final</div>
              ${subRes.finals.map(f => `
                <div class="flex items-center justify-between text-xs" style="padding: 6px 10px; background: var(--bg-surface-raised); border-radius: var(--radius-sm); margin-bottom: 4px;">
                  <span class="text-secondary">${Utils.escapeHTML(f.title)}</span>
                  <div class="flex items-center gap-xs">
                    <span class="font-bold text-primary">${f.grade}</span>
                    <span class="status-pill ${f.isPassed ? 'promoted' : 'failed'}" style="font-size: 10px; padding: 2px 6px;">
                      ${f.statusLabel}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }

        card.innerHTML = `
          <div class="flex items-center justify-between" style="margin-bottom: 8px;">
            <div>
              <h3 class="h3 truncate" style="color: var(--text-primary); font-size: 16px;">${Utils.escapeHTML(subRes.subjectName)}</h3>
              <div class="text-xs text-muted">Mín. regular: ${subRes.minPassGrade} • Mín. promo: ${subRes.minPromotionGrade}</div>
            </div>
            <div style="text-align: right;">
              <span class="status-pill ${statusClass}">${subRes.statusLabel}</span>
              ${subRes.average !== null ? `<div class="font-bold text-accent" style="font-size: 16px; margin-top: 2px;">Promedio: ${subRes.average}</div>` : ''}
            </div>
          </div>

          <div style="margin-top: 8px;">
            <div class="flex items-center justify-between text-xs font-semibold text-muted" style="margin-bottom: 6px; text-transform: uppercase;">
              <span>Parciales de Cursada</span>
              <button type="button" class="btn btn-ghost btn-sm btn-add-partial" data-sub-id="${subRes.subjectId}" style="padding: 2px 6px; min-height: 24px; font-size: 11px;">
                ${Utils.getIcon('plus', 12)}
                <span>Cargar Parcial</span>
              </button>
            </div>
            ${partialsHTML}
            ${finalsHTML}
          </div>
        `;

        card.querySelector('.btn-add-partial').addEventListener('click', (e) => {
          e.stopPropagation();
          EventForm.open(modalContainer, state, null, {
            subjectId: subRes.subjectId,
            type: 'parcial'
          }, () => this.render(containerEl, state, modalContainer));
        });

        subjectCardsContainer.appendChild(card);
      });

      wrapper.appendChild(subjectCardsContainer);
    }

    // Independent Finals Section
    if (independentFinals.length > 0) {
      const finalsSection = document.createElement('div');
      finalsSection.style.marginTop = '24px';
      finalsSection.innerHTML = `
        <h3 class="section-title" style="margin-bottom: 12px;">Finales Independientes / Libres</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${independentFinals.map(f => `
            <div class="card flex items-center justify-between">
              <div>
                <div class="font-semibold text-primary">${Utils.escapeHTML(f.title)}</div>
                <div class="text-xs text-secondary">Fecha: ${Utils.formatDateShort(f.date)}</div>
              </div>
              <div class="flex items-center gap-xs">
                ${f.hasGrade ? `<span class="font-bold text-primary" style="font-size: 14px;">Nota: ${f.grade}</span>` : ''}
                <span class="status-pill ${f.isPassed ? 'promoted' : f.hasGrade ? 'failed' : 'pending'}">${f.statusLabel}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      wrapper.appendChild(finalsSection);
    }

    containerEl.appendChild(wrapper);
  }
};
