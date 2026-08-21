/**
 * ==========================================================================
 * STORAGE & PERSISTENCE MODULE
 * Versioned LocalStorage with Schema Migrations, Demo Seeding, Export & Import
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from './utils.js';

export const Storage = {
  STORAGE_KEY: 'agenda_semanal_data_v1',
  SCHEMA_VERSION: 1,

  /**
   * Load data from localStorage or seed initial demo data if new install
   */
  loadData() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        const initialData = this.getDemoData();
        this.saveData(initialData);
        return initialData;
      }

      const parsed = JSON.parse(raw);
      return this.migrateSchema(parsed);
    } catch (e) {
      console.error('Error loading data from localStorage, fallback to demo data:', e);
      const fallback = this.getDemoData();
      return fallback;
    }
  },

  /**
   * Persist current state to localStorage
   */
  saveData(data) {
    try {
      const payload = {
        version: this.SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        settings: data.settings || { theme: 'dark' },
        subjects: Array.isArray(data.subjects) ? data.subjects : [],
        events: Array.isArray(data.events) ? data.events : [],
        tasks: Array.isArray(data.tasks) ? data.tasks : []
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
      return false;
    }
  },

  /**
   * Schema migration handler for future versions
   */
  migrateSchema(data) {
    if (!data || typeof data !== 'object') {
      return this.getDemoData();
    }

    let version = data.version || 0;

    // Migrate from v0 or unversioned
    if (version < 1) {
      data.version = 1;
      data.settings = data.settings || { theme: 'dark' };
      data.subjects = Array.isArray(data.subjects) ? data.subjects : [];
      data.events = Array.isArray(data.events) ? data.events : [];
      data.tasks = Array.isArray(data.tasks) ? data.tasks : [];
    }

    return data;
  },

  /**
   * Export all data as JSON string
   */
  exportJSON(currentState) {
    const exportObject = {
      app: 'Agenda Semanal',
      version: this.SCHEMA_VERSION,
      exportDate: new Date().toISOString(),
      data: {
        settings: currentState.settings,
        subjects: currentState.subjects,
        events: currentState.events,
        tasks: currentState.tasks
      }
    };
    return JSON.stringify(exportObject, null, 2);
  },

  /**
   * Validate uploaded JSON file structure
   */
  validateImportJSON(jsonString) {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      
      // Structure can be direct state or export wrapper { app, data: {...} }
      const payload = parsed.data || parsed;

      if (!payload || typeof payload !== 'object') {
        return { valid: false, error: 'El archivo JSON no tiene un formato válido.' };
      }

      if (!Array.isArray(payload.subjects) || !Array.isArray(payload.events) || !Array.isArray(payload.tasks)) {
        return { valid: false, error: 'Estructura incompatible: faltan materias, eventos o pendientes.' };
      }

      return {
        valid: true,
        data: {
          version: this.SCHEMA_VERSION,
          settings: payload.settings || { theme: 'dark' },
          subjects: payload.subjects,
          events: payload.events,
          tasks: payload.tasks
        },
        counts: {
          subjects: payload.subjects.length,
          events: payload.events.length,
          tasks: payload.tasks.length
        }
      };
    } catch (e) {
      return { valid: false, error: 'Error de sintaxis JSON: ' + e.message };
    }
  },

  /**
   * Wipe all data from storage
   */
  wipeAllData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Error wiping localStorage:', e);
      return false;
    }
  },

  /**
   * Generate realistic university demo data for a fresh installation
   */
  getDemoData() {
    const sub1Id = Utils.generateId();
    const sub2Id = Utils.generateId();
    const sub3Id = Utils.generateId();
    const sub4Id = Utils.generateId();

    return {
      version: this.SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      settings: {
        theme: 'dark'
      },
      subjects: [
        {
          id: sub1Id,
          name: 'Análisis Matemático II',
          professor: 'Lic. Rossi',
          color: '#7C6BEF',
          notes: 'Aula 302 - Guía de ejercicios en el campus virtual',
          minPassGrade: 4,
          minPromotionGrade: 8,
          schedules: [
            { dayIndex: 0, startTime: '08:00', endTime: '10:00', classroom: 'Aula 302' }, // Lunes
            { dayIndex: 2, startTime: '08:00', endTime: '10:00', classroom: 'Aula 302' }  // Miércoles
          ]
        },
        {
          id: sub2Id,
          name: 'Algoritmos y Estructuras de Datos',
          professor: 'Ing. Martínez',
          color: '#3B82F6',
          notes: 'Laboratorio 2 - Entorno Linux y C++',
          minPassGrade: 4,
          minPromotionGrade: 7,
          schedules: [
            { dayIndex: 1, startTime: '10:15', endTime: '12:15', classroom: 'Lab 2' }, // Martes
            { dayIndex: 3, startTime: '10:15', endTime: '12:15', classroom: 'Lab 2' }  // Jueves
          ]
        },
        {
          id: sub3Id,
          name: 'Arquitectura de Computadoras',
          professor: 'Dr. Gómez',
          color: '#10B981',
          notes: 'Teoría y Taller de ensamblador',
          minPassGrade: 4,
          minPromotionGrade: 7,
          schedules: [
            { dayIndex: 4, startTime: '08:30', endTime: '11:30', classroom: 'Aula 105' } // Viernes
          ]
        },
        {
          id: sub4Id,
          name: 'Bases de Datos I',
          professor: 'Mg. Fernández',
          color: '#F59E0B',
          notes: 'Consultas SQL y Modelado Relacional',
          minPassGrade: 4,
          minPromotionGrade: 7,
          schedules: [
            { dayIndex: 2, startTime: '14:00', endTime: '17:00', classroom: 'Lab 4' } // Miércoles
          ]
        }
      ],
      events: [
        {
          id: Utils.generateId(),
          title: 'Primer Parcial - Análisis II',
          subjectId: sub1Id,
          type: 'parcial', // parcial, tp, entrega, final, recuperatorio, otro
          date: '2026-08-24', // Próximo lunes (en 3 días)
          startTime: '08:00',
          endTime: '10:30',
          description: 'Límites, derivadas parciales y extremos relativos',
          priority: 'alta',
          status: 'pendiente',
          grade: null
        },
        {
          id: Utils.generateId(),
          title: 'Entrega TP 1 - Árboles y Grafos',
          subjectId: sub2Id,
          type: 'tp',
          date: '2026-08-22', // Mañana
          startTime: '18:00',
          endTime: '19:00',
          description: 'Subir código en C++ y reporte de complejidad al campus',
          priority: 'alta',
          status: 'en_progreso',
          grade: null
        },
        {
          id: Utils.generateId(),
          title: 'Parcial 1 - Bases de Datos',
          subjectId: sub4Id,
          type: 'parcial',
          date: '2026-08-10',
          startTime: '14:00',
          endTime: '16:00',
          description: 'Modelo Entidad-Relación y Normalización',
          priority: 'media',
          status: 'completado',
          grade: 8.5
        },
        {
          id: Utils.generateId(),
          title: 'Parcial 2 - Bases de Datos',
          subjectId: sub4Id,
          type: 'parcial',
          date: '2026-08-18',
          startTime: '14:00',
          endTime: '16:00',
          description: 'Álgebra Relacional y Consultas SQL complejas',
          priority: 'media',
          status: 'completado',
          grade: 9.0
        },
        {
          id: Utils.generateId(),
          title: 'Final - Álgebra Lineal',
          subjectId: null, // Final independiente o libre
          type: 'final',
          date: '2026-08-04',
          startTime: '09:00',
          endTime: '12:00',
          description: 'Mesa de examen final de Agosto',
          priority: 'alta',
          status: 'completado',
          grade: 7.0
        }
      ],
      tasks: [
        {
          id: Utils.generateId(),
          title: 'Repasar integrales dobles y derivadas parciales',
          subjectId: sub1Id,
          dueDate: '2026-08-23',
          priority: 'alta',
          description: 'Ejercicios 15 al 32 de la guía de trabajos prácticos.',
          status: 'pendiente' // pendiente, en_progreso, completado
        },
        {
          id: Utils.generateId(),
          title: 'Terminar algoritmo de balanceo AVL en C++',
          subjectId: sub2Id,
          dueDate: '2026-08-22',
          priority: 'alta',
          description: 'Testear casos extremos de inserción y rotaciones dobles.',
          status: 'en_progreso'
        },
        {
          id: Utils.generateId(),
          title: 'Descargar apuntes de Pipeline y Caché',
          subjectId: sub3Id,
          dueDate: '2026-08-21',
          priority: 'media',
          description: 'Capítulo 4 del libro de Patterson & Hennessy.',
          status: 'completado'
        },
        {
          id: Utils.generateId(),
          title: 'Comprar hojas cuadriculadas y lapiceras',
          subjectId: null,
          dueDate: '2026-08-25',
          priority: 'baja',
          description: 'Librería de la facultad.',
          status: 'pendiente'
        }
      ]
    };
  }
};
