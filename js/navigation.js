/**
 * ==========================================================================
 * NAVIGATION CONTROLLER
 * Bottom Navigation Bar & Top-level View Routing
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { HomeView } from './views/home.js';
import { CalendarView } from './views/calendar-view.js';
import { MoreView } from './views/more-view.js';

export const Navigation = {
  activeTab: 'home',
  state: null,
  views: {},
  navButtons: {},
  modalContainer: null,
  showToastFn: null,

  init(state, modalContainer, showToastFn) {
    this.state = state;
    this.modalContainer = modalContainer;
    this.showToastFn = showToastFn;

    // Cache DOM views
    this.views = {
      home: document.getElementById('view-home'),
      calendar: document.getElementById('view-calendar'),
      more: document.getElementById('view-more')
    };

    // Cache bottom nav buttons
    this.navButtons = {
      home: document.getElementById('nav-btn-home'),
      calendar: document.getElementById('nav-btn-calendar'),
      more: document.getElementById('nav-btn-more')
    };

    // Register click handlers for bottom nav
    Object.entries(this.navButtons).forEach(([tabId, btn]) => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.navigateTo(tabId);
        });
      }
    });

    // Initial navigation
    this.navigateTo('home');
  },

  navigateTo(tabId) {
    if (!this.views[tabId]) return;

    // If tapping on 'more' when already on 'more', return to Hub
    if (this.activeTab === 'more' && tabId === 'more') {
      MoreView.currentSubView = null;
    }

    this.activeTab = tabId;
    this.state.setActiveTab(tabId);

    // Update bottom nav active classes
    Object.entries(this.navButtons).forEach(([key, btn]) => {
      if (btn) {
        if (key === tabId) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        }
      }
    });

    // Update view screens visibility
    Object.entries(this.views).forEach(([key, viewEl]) => {
      if (viewEl) {
        if (key === tabId) {
          viewEl.classList.add('active');
          viewEl.setAttribute('aria-hidden', 'false');
        } else {
          viewEl.classList.remove('active');
          viewEl.setAttribute('aria-hidden', 'true');
        }
      }
    });

    // Render active view
    this.renderCurrentView();
  },

  renderCurrentView() {
    if (this.activeTab === 'home') {
      HomeView.render(this.views.home, this.state, this.modalContainer, (targetTab) => this.navigateTo(targetTab));
    } else if (this.activeTab === 'calendar') {
      CalendarView.render(this.views.calendar, this.state, this.modalContainer);
    } else if (this.activeTab === 'more') {
      MoreView.render(this.views.more, this.state, this.modalContainer, this.showToastFn);
    }
  }
};
