/**
 * ==========================================================================
 * STATE MANAGEMENT MODULE
 * Central Reactive Store with Subscriber Pattern & Entity CRUD
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Storage } from './storage.js';
import { Utils } from './utils.js';

class AppState {
  constructor() {
    this.subscribers = new Set();
    this.data = {
      settings: { theme: 'dark' },
      subjects: [],
      events: [],
      tasks: []
    };
    this.ui = {
      activeTab: 'home', // 'home' | 'calendar' | 'more'
      activeMoreSubView: null, // null | 'subjects' | 'tasks' | 'grades' | 'stats' | 'settings'
      calendarSubView: 'weekly', // 'weekly' | 'monthly' | 'term'
      currentWeekMonday: this.getInitialMonday(),
      selectedCalendarDay: new Date()
    };
  }

  getInitialMonday() {
    const today = new Date();
    // Monday is 1, Sunday is 0. Map to 0=Mon, ..., 6=Sun
    const dayOfWeek = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  /**
   * Initialize state from storage
   */
  init() {
    const stored = Storage.loadData();
    this.data = stored;
    this.applyTheme(this.data.settings?.theme || 'dark');
    this.notify('init');
  }

  /**
   * Subscribe to state updates
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers of a change
   */
  notify(eventType = 'change', payload = null) {
    this.subscribers.forEach(fn => {
      try {
        fn(eventType, this, payload);
      } catch (err) {
        console.error('Error in state subscriber:', err);
      }
    });
  }

  /**
   * Save current data to storage and notify
   */
  commit(eventType = 'change') {
    Storage.saveData(this.data);
    this.notify(eventType);
  }

  /* ==========================================================================
     UI / NAVIGATION STATE
     ========================================================================== */

  setActiveTab(tabId) {
    if (this.ui.activeTab !== tabId) {
      this.ui.activeTab = tabId;
      this.notify('ui_tab_changed', tabId);
    }
  }

  setMoreSubView(subViewName) {
    this.ui.activeMoreSubView = subViewName;
    this.notify('ui_more_subview_changed', subViewName);
  }

  setCalendarSubView(subView) {
    this.ui.calendarSubView = subView;
    this.notify('ui_calendar_subview_changed', subView);
  }

  setCurrentWeekMonday(mondayDate) {
    this.ui.currentWeekMonday = new Date(mondayDate);
    this.notify('ui_week_changed', this.ui.currentWeekMonday);
  }

  setSelectedCalendarDay(date) {
    this.ui.selectedCalendarDay = new Date(date);
    this.notify('ui_calendar_day_selected', this.ui.selectedCalendarDay);
  }

  /* ==========================================================================
     SUBJECTS CRUD
     ========================================================================== */

  get subjects() {
    return this.data.subjects || [];
  }

  getSubjectById(id) {
    if (!id) return null;
    return this.subjects.find(s => s.id === id) || null;
  }

  addSubject(subjectData) {
    const newSubject = {
      id: Utils.generateId(),
      name: subjectData.name.trim(),
      professor: subjectData.professor?.trim() || '',
      color: subjectData.color || Utils.SUBJECT_COLORS[this.subjects.length % Utils.SUBJECT_COLORS.length],
      notes: subjectData.notes?.trim() || '',
      minPassGrade: parseFloat(subjectData.minPassGrade) || 4,
      minPromotionGrade: parseFloat(subjectData.minPromotionGrade) || 7,
      schedules: Array.isArray(subjectData.schedules) ? subjectData.schedules : []
    };

    this.data.subjects.push(newSubject);
    this.commit('subjects_changed');
    return newSubject;
  }

  updateSubject(id, updates) {
    const idx = this.data.subjects.findIndex(s => s.id === id);
    if (idx === -1) return null;

    const existing = this.data.subjects[idx];
    this.data.subjects[idx] = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      minPassGrade: updates.minPassGrade !== undefined ? parseFloat(updates.minPassGrade) : existing.minPassGrade,
      minPromotionGrade: updates.minPromotionGrade !== undefined ? parseFloat(updates.minPromotionGrade) : existing.minPromotionGrade
    };

    this.commit('subjects_changed');
    return this.data.subjects[idx];
  }

  deleteSubject(id) {
    this.data.subjects = this.data.subjects.filter(s => s.id !== id);
    // Optionally clear or unlink subject reference from events and tasks
    this.data.events = this.data.events.map(ev => ev.subjectId === id ? { ...ev, subjectId: null } : ev);
    this.data.tasks = this.data.tasks.map(t => t.subjectId === id ? { ...t, subjectId: null } : t);

    this.commit('subjects_changed');
  }

  /* ==========================================================================
     EVENTS CRUD
     Types: 'parcial' | 'tp' | 'entrega' | 'final' | 'recuperatorio' | 'otro'
     ========================================================================== */

  get events() {
    return this.data.events || [];
  }

  getEventById(id) {
    if (!id) return null;
    return this.events.find(e => e.id === id) || null;
  }

  getEventsForDate(dateStrOrObj) {
    const targetISO = typeof dateStrOrObj === 'string' && dateStrOrObj.includes('-') 
      ? dateStrOrObj.split('T')[0]
      : Utils.formatDateISO(dateStrOrObj);
    return this.events.filter(e => e.date === targetISO);
  }

  getEventsForSubject(subjectId) {
    return this.events.filter(e => e.subjectId === subjectId);
  }

  addEvent(eventData) {
    const newEvent = {
      id: Utils.generateId(),
      title: eventData.title.trim(),
      subjectId: eventData.subjectId || null,
      type: eventData.type || 'parcial',
      date: eventData.date, // YYYY-MM-DD
      startTime: eventData.startTime || '08:00',
      endTime: eventData.endTime || '10:00',
      description: eventData.description?.trim() || '',
      priority: eventData.priority || 'media',
      status: eventData.status || 'pendiente', // 'pendiente' | 'en_progreso' | 'completado'
      grade: (eventData.grade !== null && eventData.grade !== undefined && eventData.grade !== '') 
        ? parseFloat(eventData.grade) 
        : null
    };

    this.data.events.push(newEvent);
    this.commit('events_changed');
    return newEvent;
  }

  updateEvent(id, updates) {
    const idx = this.data.events.findIndex(e => e.id === id);
    if (idx === -1) return null;

    const existing = this.data.events[idx];
    const updatedGrade = (updates.grade !== undefined && updates.grade !== '' && updates.grade !== null)
      ? parseFloat(updates.grade)
      : (updates.grade === '' || updates.grade === null ? null : existing.grade);

    this.data.events[idx] = {
      ...existing,
      ...updates,
      id: existing.id,
      grade: updatedGrade
    };

    this.commit('events_changed');
    return this.data.events[idx];
  }

  deleteEvent(id) {
    this.data.events = this.data.events.filter(e => e.id !== id);
    this.commit('events_changed');
  }

  /* ==========================================================================
     TASKS / PENDIENTES CRUD
     Status: 'pendiente' | 'en_progreso' | 'completado'
     ========================================================================== */

  get tasks() {
    return this.data.tasks || [];
  }

  getTaskById(id) {
    if (!id) return null;
    return this.tasks.find(t => t.id === id) || null;
  }

  getTasksForSubject(subjectId) {
    return this.tasks.filter(t => t.subjectId === subjectId);
  }

  addTask(taskData) {
    const newTask = {
      id: Utils.generateId(),
      title: taskData.title.trim(),
      subjectId: taskData.subjectId || null,
      dueDate: taskData.dueDate || Utils.formatDateISO(new Date()),
      priority: taskData.priority || 'media',
      description: taskData.description?.trim() || '',
      status: taskData.status || 'pendiente'
    };

    this.data.tasks.push(newTask);
    this.commit('tasks_changed');
    return newTask;
  }

  updateTask(id, updates) {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;

    const existing = this.data.tasks[idx];
    this.data.tasks[idx] = {
      ...existing,
      ...updates,
      id: existing.id
    };

    this.commit('tasks_changed');
    return this.data.tasks[idx];
  }

  toggleTaskStatus(id) {
    const task = this.getTaskById(id);
    if (!task) return;

    let nextStatus = 'pendiente';
    if (task.status === 'pendiente') nextStatus = 'en_progreso';
    else if (task.status === 'en_progreso') nextStatus = 'completado';
    else if (task.status === 'completado') nextStatus = 'pendiente';

    this.updateTask(id, { status: nextStatus });
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.commit('tasks_changed');
  }

  /* ==========================================================================
     SETTINGS & THEME
     ========================================================================== */

  get settings() {
    return this.data.settings || { theme: 'dark' };
  }

  setTheme(themeName) {
    const theme = themeName === 'light' ? 'light' : 'dark';
    this.data.settings = { ...this.data.settings, theme };
    this.applyTheme(theme);
    this.commit('theme_changed');
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /* ==========================================================================
     BULK IMPORT & RESET
     ========================================================================== */

  importData(importedData) {
    this.data = {
      version: Storage.SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      settings: importedData.settings || { theme: 'dark' },
      subjects: importedData.subjects || [],
      events: importedData.events || [],
      tasks: importedData.tasks || []
    };
    this.applyTheme(this.data.settings.theme);
    this.commit('all');
  }

  resetAllData() {
    Storage.wipeAllData();
    const demo = Storage.getDemoData();
    this.data = demo;
    this.applyTheme(this.data.settings.theme);
    this.commit('all');
  }
}

export const State = new AppState();
