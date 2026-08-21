/**
 * ==========================================================================
 * GRADE CALCULATOR & ACADEMIC ENGINE
 * Agenda Semanal - Academic Planner
 * ==========================================================================
 *
 * Rules:
 * 1. ONLY 'parcial' events with a numeric grade count towards subject average.
 * 2. TPs, entregas, recuperatorios, and finales DO NOT count towards average.
 * 3. Each subject has configurable minPassGrade and minPromotionGrade:
 *    - promedio < minPassGrade           => 'Desaprobado'
 *    - minPassGrade <= promedio < minPromo => 'Aprobado'
 *    - promedio >= minPromotionGrade     => 'Promocionado'
 * 4. Finales are evaluated INDEPENDENTLY of the subject average:
 *    - final.grade >= 4  => 'Materia aprobada'
 *    - final.grade < 4   => 'Materia desaprobada'
 *    (The 4.0 threshold for finals is fixed).
 */

export const GradeCalculator = {
  /**
   * Calculate academic status and average for a single subject
   */
  calculateSubjectGrades(subject, allEvents) {
    if (!subject) return null;

    const minPass = parseFloat(subject.minPassGrade) || 4.0;
    const minPromo = parseFloat(subject.minPromotionGrade) || 7.0;

    // Filter events for this subject
    const subjectEvents = allEvents.filter(e => e.subjectId === subject.id);

    // Filter ONLY 'parcial' events that have a valid numeric grade
    const gradedPartials = subjectEvents.filter(
      e => e.type === 'parcial' && e.grade !== null && e.grade !== undefined && !isNaN(e.grade)
    );

    // Filter finals for this subject
    const subjectFinals = subjectEvents.filter(
      e => e.type === 'final' && e.grade !== null && e.grade !== undefined && !isNaN(e.grade)
    );

    let average = null;
    let academicStatus = 'sin_notas'; // 'sin_notas' | 'desaprobado' | 'aprobado' | 'promocionado'
    let statusLabel = 'Sin notas';

    if (gradedPartials.length > 0) {
      const sum = gradedPartials.reduce((acc, p) => acc + parseFloat(p.grade), 0);
      average = parseFloat((sum / gradedPartials.length).toFixed(2));

      if (average < minPass) {
        academicStatus = 'desaprobado';
        statusLabel = 'Desaprobado';
      } else if (average < minPromo) {
        academicStatus = 'aprobado';
        statusLabel = 'Aprobado';
      } else {
        academicStatus = 'promocionado';
        statusLabel = 'Promocionado';
      }
    }

    // Evaluate finals (independent)
    const processedFinals = subjectFinals.map(f => {
      const g = parseFloat(f.grade);
      const isPassed = g >= 4.0;
      return {
        id: f.id,
        title: f.title,
        grade: g,
        date: f.date,
        isPassed,
        statusLabel: isPassed ? 'Materia aprobada' : 'Materia desaprobada'
      };
    });

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color,
      minPassGrade: minPass,
      minPromotionGrade: minPromo,
      gradedPartials: gradedPartials.map(p => ({
        id: p.id,
        title: p.title,
        grade: parseFloat(p.grade),
        date: p.date
      })),
      average,
      academicStatus,
      statusLabel,
      finals: processedFinals
    };
  },

  /**
   * Evaluate all standalone / free final exams not tied to a subject
   */
  getIndependentFinals(allEvents) {
    return allEvents
      .filter(e => e.type === 'final' && (!e.subjectId || e.subjectId === ''))
      .map(f => {
        const hasGrade = f.grade !== null && f.grade !== undefined && !isNaN(f.grade);
        const gradeVal = hasGrade ? parseFloat(f.grade) : null;
        const isPassed = gradeVal !== null ? gradeVal >= 4.0 : false;
        return {
          id: f.id,
          title: f.title,
          grade: gradeVal,
          date: f.date,
          status: f.status,
          hasGrade,
          isPassed,
          statusLabel: !hasGrade ? 'Pendiente' : isPassed ? 'Materia aprobada' : 'Materia desaprobada'
        };
      });
  },

  /**
   * Calculate overall GPA and academic summary counts
   */
  calculateGlobalStats(subjects, events) {
    const subjectResults = subjects.map(s => this.calculateSubjectGrades(s, events));

    let totalParcialSum = 0;
    let totalParcialCount = 0;
    let countPromoted = 0;
    let countApproved = 0;
    let countFailed = 0;
    let countNoGrades = 0;

    subjectResults.forEach(res => {
      if (res.average !== null) {
        totalParcialSum += res.average;
        totalParcialCount++;

        if (res.academicStatus === 'promocionado') countPromoted++;
        else if (res.academicStatus === 'aprobado') countApproved++;
        else if (res.academicStatus === 'desaprobado') countFailed++;
      } else {
        countNoGrades++;
      }
    });

    const globalAverage = totalParcialCount > 0 
      ? parseFloat((totalParcialSum / totalParcialCount).toFixed(2)) 
      : null;

    // Finals count
    const allFinals = events.filter(e => e.type === 'final' && e.grade !== null && !isNaN(e.grade));
    const finalsPassed = allFinals.filter(f => parseFloat(f.grade) >= 4.0).length;
    const finalsFailed = allFinals.filter(f => parseFloat(f.grade) < 4.0).length;

    return {
      globalAverage,
      totalSubjects: subjects.length,
      countPromoted,
      countApproved,
      countFailed,
      countNoGrades,
      allFinalsCount: allFinals.length,
      finalsPassed,
      finalsFailed,
      subjectResults
    };
  }
};
