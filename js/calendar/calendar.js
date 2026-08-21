/**
 * ==========================================================================
 * MAIN CALENDAR CONTROLLER (APPLE HIG)
 * Coordinates Weekly, Monthly, and Cuatrimestral (Term) views
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';
import { CalendarUtils } from './calendar-utils.js';
import { CalendarGrid } from './calendar-grid.js';
import { CalendarEvents } from './calendar-events.js';

export const CalendarController = {
  containerEl: null,
  state: null,
  currentSubView: 'weekly', // 'weekly' | 'monthly' | 'term'
  currentDate: new Date(),
  currentMonday: CalendarUtils.getMondayOfWeek(new Date()),
  callbacks: {},

  init(containerEl, state, callbacks = {}) {
    this.containerEl = containerEl;
    this.state = state;
    this.callbacks = callbacks;
    this.currentSubView = state.ui.calendarSubView || 'weekly';
    this.currentMonday = state.ui.currentWeekMonday || CalendarUtils.getMondayOfWeek(new Date());

    this.render();
  },

  setSubView(subView) {
    this.currentSubView = subView;
    this.state.setCalendarSubView(subView);
    this.render();
  },

  goToNextPeriod() {
    if (this.currentSubView === 'weekly') {
      this.currentMonday = CalendarUtils.getNextWeekMonday(this.currentMonday);
      this.state.setCurrentWeekMonday(this.currentMonday);
    } else if (this.currentSubView === 'monthly') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    } else if (this.currentSubView === 'term') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 4, 1);
    }
    this.render();
  },

  goToPrevPeriod() {
    if (this.currentSubView === 'weekly') {
      this.currentMonday = CalendarUtils.getPrevWeekMonday(this.currentMonday);
      this.state.setCurrentWeekMonday(this.currentMonday);
    } else if (this.currentSubView === 'monthly') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    } else if (this.currentSubView === 'term') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 4, 1);
    }
    this.render();
  },

  goToToday() {
    const today = new Date();
    this.currentDate = today;
    this.currentMonday = CalendarUtils.getMondayOfWeek(today);
    this.state.setCurrentWeekMonday(this.currentMonday);
    this.state.setSelectedCalendarDay(today);
    this.render();
  },

  render() {
    if (!this.containerEl) return;
    this.containerEl.innerHTML = '';

    const calWrapper = document.createElement('div');
    calWrapper.className = 'calendar-container';

    // 1. Top Controls Bar
    const topBar = this.renderTopBar();
    calWrapper.appendChild(topBar);

    // 2. View Content
    const viewContent = document.createElement('div');
    viewContent.style.flex = '1';
    viewContent.style.overflow = 'hidden';
    viewContent.style.display = 'flex';
    viewContent.style.flexDirection = 'column';

    if (this.currentSubView === 'weekly') {
      CalendarGrid.renderWeeklyGrid(viewContent, this.currentMonday, this.state, {
        onChipClick: (item) => {
          if (typeof this.callbacks.onItemClick === 'function') {
            this.callbacks.onItemClick(item);
          }
        },
        onEmptySlotClick: (slotInfo) => {
          if (typeof this.callbacks.onEmptySlotClick === 'function') {
            this.callbacks.onEmptySlotClick(slotInfo);
          }
        }
      });
    } else if (this.currentSubView === 'monthly') {
      this.renderMonthlyView(viewContent);
    } else if (this.currentSubView === 'term') {
      this.renderTermView(viewContent);
    }

    calWrapper.appendChild(viewContent);
    this.containerEl.appendChild(calWrapper);
  },

  renderTopBar() {
    const bar = document.createElement('div');
    bar.className = 'calendar-top-bar';

    // Segmented View Switcher
    const segmented = document.createElement('div');
    segmented.className = 'segmented-control';

    const views = [
      { id: 'weekly', label: 'Semanal' },
      { id: 'monthly', label: 'Mensual' },
      { id: 'term', label: 'Cuatrimestral' }
    ];

    views.forEach(v => {
      const btn = document.createElement('button');
      btn.className = `segmented-btn ${this.currentSubView === v.id ? 'active' : ''}`;
      btn.textContent = v.label;
      btn.type = 'button';
      btn.addEventListener('click', () => this.setSubView(v.id));
      segmented.appendChild(btn);
    });

    // Navigation Controls
    const navRow = document.createElement('div');
    navRow.className = 'calendar-nav-controls';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-secondary btn-sm';
    prevBtn.innerHTML = Utils.getIcon('chevronLeft', 16);
    prevBtn.setAttribute('aria-label', 'Período anterior');
    prevBtn.addEventListener('click', () => this.goToPrevPeriod());

    let labelText = '';
    if (this.currentSubView === 'weekly') {
      labelText = CalendarUtils.formatWeekRange(this.currentMonday);
    } else if (this.currentSubView === 'monthly') {
      labelText = `${Utils.MONTHS_FULL[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    } else if (this.currentSubView === 'term') {
      const isSecondTerm = this.currentDate.getMonth() >= 7;
      labelText = `${isSecondTerm ? '2° Cuatrimestre' : '1° Cuatrimestre'} ${this.currentDate.getFullYear()}`;
    }

    const periodLabel = document.createElement('div');
    periodLabel.className = 'calendar-period-label';
    periodLabel.textContent = labelText;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-secondary btn-sm';
    nextBtn.innerHTML = Utils.getIcon('chevronRight', 16);
    nextBtn.setAttribute('aria-label', 'Siguiente período');
    nextBtn.addEventListener('click', () => this.goToNextPeriod());

    const todayBtn = document.createElement('button');
    todayBtn.className = 'btn btn-primary btn-sm';
    todayBtn.textContent = 'Hoy';
    todayBtn.type = 'button';
    todayBtn.addEventListener('click', () => this.goToToday());

    const actionsGroup = document.createElement('div');
    actionsGroup.className = 'calendar-actions';
    actionsGroup.appendChild(prevBtn);
    actionsGroup.appendChild(nextBtn);
    actionsGroup.appendChild(todayBtn);

    navRow.appendChild(periodLabel);
    navRow.appendChild(actionsGroup);

    bar.appendChild(segmented);
    bar.appendChild(navRow);

    return bar;
  },

  renderMonthlyView(containerEl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'month-view-container';

    // Weekdays header
    const weekdaysHeader = document.createElement('div');
    weekdaysHeader.className = 'month-weekdays-header';
    Utils.DAYS_SHORT.forEach(dName => {
      const lbl = document.createElement('div');
      lbl.className = 'month-weekday-label';
      lbl.textContent = dName;
      weekdaysHeader.appendChild(lbl);
    });
    wrapper.appendChild(weekdaysHeader);

    // Days Matrix
    const matrix = document.createElement('div');
    matrix.className = 'month-matrix';

    const monthDays = CalendarUtils.getMonthMatrix(this.currentDate.getFullYear(), this.currentDate.getMonth());
    let selectedDate = this.state.ui.selectedCalendarDay || new Date();

    const agendaContainer = document.createElement('div');
    agendaContainer.className = 'month-agenda-panel';

    const renderAgendaForDate = (targetDate) => {
      agendaContainer.innerHTML = '';
      const dayIndex = (targetDate.getDay() + 6) % 7;
      const items = CalendarEvents.collectItemsForDay(targetDate, dayIndex, this.state);

      const header = document.createElement('h3');
      header.className = 'h3';
      header.style.marginBottom = '12px';
      header.textContent = Utils.formatDateNatural(targetDate);
      agendaContainer.appendChild(header);

      if (items.length === 0) {
        agendaContainer.innerHTML += `
          <div class="card empty-state" style="padding: 24px;">
            <div class="empty-state-icon-wrap">${Utils.getIcon('calendar', 20)}</div>
            <div class="empty-state-title">Sin actividades</div>
            <div class="empty-state-desc">No hay clases ni eventos programados para este día.</div>
          </div>
        `;
        return;
      }

      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card card-clickable';
        card.style.marginBottom = '8px';
        card.style.borderLeft = `4px solid ${item.color || 'var(--color-accent)'}`;
        
        card.innerHTML = `
          <div class="flex items-center justify-between" style="margin-bottom: 4px;">
            <div class="font-semibold text-primary">${Utils.escapeHTML(item.title)}</div>
            ${item.typeLabel ? `<span class="badge" style="background: ${item.typeColor}22; color: ${item.typeColor};">${item.typeLabel}</span>` : '<span class="badge" style="background: var(--color-accent-subtle); color: var(--color-accent);">Clase</span>'}
          </div>
          <div class="mini-timeline-meta" style="margin-top: 4px;">
            <span class="meta-item">
              ${Utils.getIcon('clock', 12)}
              <span>${Utils.escapeHTML(item.startTime)} – ${Utils.escapeHTML(item.endTime)}</span>
            </span>
            ${item.classroom ? `
              <span class="meta-item">
                ${Utils.getIcon('pin', 12)}
                <span>${Utils.escapeHTML(item.classroom)}</span>
              </span>
            ` : ''}
          </div>
          ${item.description ? `<div class="text-xs text-muted" style="margin-top: 4px;">${Utils.escapeHTML(item.description)}</div>` : ''}
        `;

        card.addEventListener('click', () => {
          if (typeof this.callbacks.onItemClick === 'function') {
            this.callbacks.onItemClick(item);
          }
        });

        agendaContainer.appendChild(card);
      });
    };

    monthDays.forEach(dayInfo => {
      const cell = document.createElement('div');
      const isSelected = Utils.isSameDay(dayInfo.date, selectedDate);
      const dayIndex = (dayInfo.date.getDay() + 6) % 7;
      const dayItems = CalendarEvents.collectItemsForDay(dayInfo.date, dayIndex, this.state);

      const hasFinal = dayItems.some(it => it.type === 'final');
      const hasParcial = dayItems.some(it => it.type === 'parcial' || it.type === 'recuperatorio');
      const examClass = hasFinal ? 'has-final' : hasParcial ? 'has-exam' : '';

      cell.className = `month-day-cell ${dayInfo.isCurrentMonth ? '' : 'other-month'} ${dayInfo.isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${examClass}`;
      
      const num = document.createElement('div');
      num.className = 'month-day-number';
      num.textContent = dayInfo.dayNumber;
      cell.appendChild(num);

      // Event dots
      if (dayItems.length > 0) {
        const dots = document.createElement('div');
        dots.className = 'month-day-dots';
        
        // Prioritize exams first in dots display
        const sortedDots = [...dayItems].sort((a, b) => (b.isExam ? 1 : 0) - (a.isExam ? 1 : 0));

        sortedDots.slice(0, 3).forEach(it => {
          const dot = document.createElement('div');
          dot.className = `month-dot ${it.isExam ? 'dot-exam' : ''}`;
          dot.style.backgroundColor = it.color || 'var(--color-accent)';
          dots.appendChild(dot);
        });
        
        cell.appendChild(dots);
      }

      cell.addEventListener('click', () => {
        wrapper.querySelectorAll('.month-day-cell').forEach(c => c.classList.remove('is-selected'));
        cell.classList.add('is-selected');
        selectedDate = dayInfo.date;
        this.state.setSelectedCalendarDay(selectedDate);
        renderAgendaForDate(selectedDate);
      });

      matrix.appendChild(cell);
    });

    wrapper.appendChild(matrix);
    renderAgendaForDate(selectedDate);
    wrapper.appendChild(agendaContainer);
    containerEl.appendChild(wrapper);
  },

  renderTermView(containerEl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'term-view-container';

    const semesterMonths = CalendarUtils.getSemesterMonths(this.currentDate);
    const events = this.state.events || [];
    const subjects = this.state.subjects || [];

    semesterMonths.forEach(mObj => {
      const monthSection = document.createElement('div');
      monthSection.className = 'term-month-section';

      const title = document.createElement('div');
      title.className = 'term-month-title';
      title.textContent = `${mObj.monthName} ${mObj.year}`;
      monthSection.appendChild(title);

      const monthEvents = events.filter(e => {
        if (!e.date) return false;
        const d = Utils.toDateObject(e.date);
        return d && d.getMonth() === mObj.monthIndex && d.getFullYear() === mObj.year;
      });

      monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

      const list = document.createElement('div');
      list.className = 'term-events-list';

      if (monthEvents.length === 0) {
        list.innerHTML = `<div class="text-xs text-muted" style="padding: 6px 0;">Sin eventos registrados para este mes.</div>`;
      } else {
        monthEvents.forEach(ev => {
          const sub = subjects.find(s => s.id === ev.subjectId);
          const styleInfo = CalendarEvents.EVENT_TYPE_STYLES[ev.type] || CalendarEvents.EVENT_TYPE_STYLES.otro;

          const card = document.createElement('div');
          card.className = 'card card-clickable flex items-center justify-between';
          card.style.padding = '12px 14px';
          card.style.borderLeft = `4px solid ${styleInfo.color}`;

          card.innerHTML = `
            <div style="flex: 1; min-width: 0;">
              <div class="flex items-center gap-sm" style="margin-bottom: 2px;">
                <span class="badge" style="background: ${styleInfo.color}22; color: ${styleInfo.color};">${styleInfo.label}</span>
                <span class="font-semibold text-primary truncate">${Utils.escapeHTML(ev.title)}</span>
              </div>
              <div class="text-xs text-secondary">
                ${sub ? `${Utils.escapeHTML(sub.name)} • ` : ''}${Utils.formatDateShort(ev.date)} (${ev.startTime || '08:00'})
              </div>
            </div>
            ${ev.grade !== null && ev.grade !== undefined ? `<div class="status-pill promoted" style="margin-left: 8px;">Nota: ${ev.grade}</div>` : ''}
          `;

          card.addEventListener('click', () => {
            if (typeof this.callbacks.onItemClick === 'function') {
              this.callbacks.onItemClick({ itemType: 'event', id: ev.id });
            }
          });

          list.appendChild(card);
        });
      }

      monthSection.appendChild(list);
      wrapper.appendChild(monthSection);
    });

    containerEl.appendChild(wrapper);
  }
};
