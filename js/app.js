/**
 * ==========================================================================
 * APP ENTRY POINT & BOOTSTRAP
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { State } from './state.js';
import { Navigation } from './navigation.js';
import { Utils } from './utils.js';

export const App = {
  toastContainer: null,
  modalContainer: null,

  init() {
    // 1. Mount Points
    this.toastContainer = document.getElementById('toast-container');
    this.modalContainer = document.getElementById('modal-container');

    // 2. Initialize Reactive State
    State.init();

    // 3. Initialize Navigation Router
    Navigation.init(State, this.modalContainer, (msg, type) => this.showToast(msg, type));

    // 4. Subscribe to state changes for auto re-render
    State.subscribe((eventType) => {
      // Don't auto re-render tab switch twice as Navigation handles it
      if (eventType !== 'ui_tab_changed' && eventType !== 'init') {
        Navigation.renderCurrentView();
      }
    });

    // 5. Timer for updating calendar now indicator every minute
    setInterval(() => {
      if (Navigation.activeTab === 'calendar' && State.ui.calendarSubView === 'weekly') {
        Navigation.renderCurrentView();
      }
    }, 60000);

    // 6. Android WebView & Mobile Viewport adjustments
    this.setupViewportFixes();

    // 7. Register Service Worker for PWA (PWABuilder & Offline)
    this.registerServiceWorker();

    console.log('Agenda Semanal initialized successfully.');
  },

  /**
   * Display a floating toast notification
   */
  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = Utils.getIcon('info', 16);
    if (type === 'success') icon = Utils.getIcon('check', 16);
    else if (type === 'danger') icon = Utils.getIcon('close', 16);

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  },

  /**
   * Fixes for mobile 100dvh & safe areas
   */
  setupViewportFixes() {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setAppHeight, 150);
    });
    setAppHeight();
  },

  /**
   * Register Service Worker for offline capability & PWA installability
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('PWA Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('PWA Service Worker registration failed:', error);
          });
      });
    }
  }
};

// Start application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
