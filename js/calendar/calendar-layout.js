/**
 * ==========================================================================
 * CALENDAR LAYOUT & COLLISION ENGINE
 * Proportional time positioning and overlapping event column splitting
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 */

import { Utils } from '../utils.js';

export const CalendarLayout = {
  START_HOUR: 6,       // 06:00
  END_HOUR: 24,        // 00:00 (next day)
  TOTAL_HOURS: 18,     // 18 hours
  START_MINUTES: 360,  // 6 * 60
  TOTAL_MINUTES: 1080, // 18 * 60

  /**
   * Calculate top percentage and height percentage from start and end time strings
   */
  calculateTimeGeometry(startTime, endTime) {
    const rawStart = Utils.timeToMinutes(startTime);
    let rawEnd = Utils.timeToMinutes(endTime);

    // If endTime is 00:00 (next day midnight), treat as 1440 minutes (24:00)
    if (rawEnd === 0 || rawEnd <= rawStart) {
      rawEnd = Math.max(rawStart + 60, 1440);
    }

    // Clamp within 06:00 (360) and 24:00 (1440)
    const clampedStart = Math.max(this.START_MINUTES, Math.min(rawStart, this.START_MINUTES + this.TOTAL_MINUTES));
    const clampedEnd = Math.max(clampedStart + 20, Math.min(rawEnd, this.START_MINUTES + this.TOTAL_MINUTES));

    const startOffsetMinutes = clampedStart - this.START_MINUTES;
    const durationMinutes = clampedEnd - clampedStart;

    const topPercent = (startOffsetMinutes / this.TOTAL_MINUTES) * 100;
    const heightPercent = (durationMinutes / this.TOTAL_MINUTES) * 100;

    return {
      startMin: clampedStart,
      endMin: clampedEnd,
      durationMin: durationMinutes,
      topPercent,
      heightPercent
    };
  },

  /**
   * Layout a list of items (classes and events) for a single day column,
   * detecting overlapping time intervals and assigning column slots.
   */
  layoutDayItems(items) {
    if (!items || items.length === 0) return [];

    // 1. Compute geometry for each item
    const computed = items.map(item => {
      const geom = this.calculateTimeGeometry(item.startTime, item.endTime);
      return {
        ...item,
        ...geom,
        colIndex: 0,
        totalCols: 1
      };
    });

    // 2. Sort by start time ascending, then by duration descending
    computed.sort((a, b) => {
      if (a.startMin !== b.startMin) return a.startMin - b.startMin;
      return b.durationMin - a.durationMin;
    });

    // 3. Find connected overlapping clusters
    const clusters = [];
    let currentCluster = [];
    let clusterEnd = -1;

    for (const item of computed) {
      if (currentCluster.length === 0) {
        currentCluster.push(item);
        clusterEnd = item.endMin;
      } else if (item.startMin < clusterEnd) {
        // Overlaps with current cluster
        currentCluster.push(item);
        clusterEnd = Math.max(clusterEnd, item.endMin);
      } else {
        // New cluster
        clusters.push(currentCluster);
        currentCluster = [item];
        clusterEnd = item.endMin;
      }
    }
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    // 4. Assign columns within each cluster (Greedy Interval Scheduling)
    const result = [];

    clusters.forEach(cluster => {
      const columns = []; // columns[i] holds the endMin of the last item in column i

      cluster.forEach(item => {
        let placed = false;
        for (let colIdx = 0; colIdx < columns.length; colIdx++) {
          if (columns[colIdx] <= item.startMin) {
            columns[colIdx] = item.endMin;
            item.colIndex = colIdx;
            placed = true;
            break;
          }
        }
        if (!placed) {
          item.colIndex = columns.length;
          columns.push(item.endMin);
        }
      });

      const totalCols = columns.length;
      cluster.forEach(item => {
        item.totalCols = totalCols;
        item.leftPercent = (item.colIndex / totalCols) * 100;
        item.widthPercent = (100 / totalCols);
        result.push(item);
      });
    });

    return result;
  },

  /**
   * Calculate top percentage for the real-time "Now" indicator line
   */
  getCurrentTimeGeometry(nowDate = new Date()) {
    const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
    
    // Check if within 06:00 to 24:00
    if (nowMinutes < this.START_MINUTES || nowMinutes > 1440) {
      return null;
    }

    const offset = nowMinutes - this.START_MINUTES;
    const topPercent = (offset / this.TOTAL_MINUTES) * 100;

    return {
      topPercent,
      timeString: Utils.minutesToTime(nowMinutes)
    };
  }
};
