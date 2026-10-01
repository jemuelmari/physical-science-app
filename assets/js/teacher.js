/* ============================================================
   teacher.js — Physical Science · Teacher Analytics Helpers
   Version: 1.0.0
   Depends on: config.js, store.js, app.js, transmutation.js
   ============================================================ */

window.Teacher = (function () {
  'use strict';

  // ---- Load all records and index by student ----
  function buildStudentIndex() {
    const records = (window.Store && Store.getRecords()) || [];
    const map = new Map();

    records.forEach(r => {
      const key = r.lrn || 'unknown';
      if (!map.has(key)) {
        map.set(key, {
          lrn: key,
          lastName: r.lastName || '',
          firstName: r.firstName || '',
          gradeLevel: r.gradeLevel || '',
          section: r.section || '',
          scores: {},
          grades: []
        });
      }
      const s = map.get(key);
      s.scores[r.assessmentId] = r;
      s.grades.push(Number(r.finalGrade) || 0);
    });

    // Compute averages
    map.forEach(s => {
      s.average = s.grades.length
        ? Math.round(s.grades.reduce((a, b) => a + b, 0) / s.grades.length)
        : null;
      s.transmuted = s.average != null && window.Transmutation
        ? Transmutation.apply(s.average)
        : null;
      s.passed = s.transmuted != null && s.transmuted >= ((window.PHYSCI_CONFIG && PHYSCI_CONFIG.passingScore) || 75);
    });

    return Array.from(map.values());
  }

  // ---- Filter by section / grade ----
  function filterStudents(students, filters) {
    const f = filters || {};
    return students.filter(s => {
      if (f.section && s.section !== f.section) return false;
      if (f.gradeLevel && String(s.gradeLevel) !== String(f.gradeLevel)) return false;
      return true;
    });
  }

  // ---- Class summary ----
  function classSummary(students) {
    const total = students.length;
    const averages = students.map(s => s.average).filter(a => a != null);
    const classAvg = averages.length
      ? Math.round(averages.reduce((a, b) => a + b, 0) / averages.length)
      : null;
    const passed = students.filter(s => s.passed).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, classAvg, passed, passRate };
  }

  // ---- Per-assessment stats ----
  function assessmentStats(assessmentId) {
    const records = (window.Store && Store.getRecords()) || [];
    const subset = records.filter(r => r.assessmentId === assessmentId);
    if (!subset.length) return { count: 0, avg: null, min: null, max: null, passRate: 0 };

    const grades = subset.map(r => Number(r.finalGrade) || 0);
    const avg = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);
    const passed = subset.filter(r => r.passed).length;

    return {
      count: subset.length,
      avg,
      min: Math.min(...grades),
      max: Math.max(...grades),
      passRate: Math.round((passed / subset.length) * 100)
    };
  }

  // ---- Group by severity ----
  function groupBySeverity(students) {
    return {
      urgent:      students.filter(s => s.average != null && s.average < 70),
      remediation: students.filter(s => s.average != null && s.average >= 70 && s.average < 75),
      onTrack:     students.filter(s => s.average != null && s.average >= 75 && s.average < 85),
      enrichment:  students.filter(s => s.average != null && s.average >= 85)
    };
  }

  // ---- Sections present in records ----
  function getSections() {
    const set = new Set();
    ((window.Store && Store.getRecords()) || []).forEach(r => {
      if (r.section) set.add(r.section);
    });
    return Array.from(set).sort();
  }

  // ---- Item analysis (per question correct rate) ----
  async function itemAnalysis(assessmentId) {
    // Load the item bank
    let bank;
    try {
      const path = (function () {
        const here = window.location.pathname;
        if (here.includes('/teacher/')) return '../data/' + assessmentId + '.json';
        if (here.includes('/classrecord/')) return '../data/' + assessmentId + '.json';
        return 'data/' + assessmentId + '.json';
      })();
      const res = await fetch(path);
      bank = await res.json();
    } catch (e) {
      throw new Error('Failed to load item bank for ' + assessmentId);
    }

    const records = ((window.Store && Store.getRecords()) || [])
      .filter(r => r.assessmentId === assessmentId);

    const items = bank.items.map(item => {
      let correct = 0, attempted = 0;
      records.forEach(r => {
        const ans = r.answers ? r.answers[item.id] : null;
        if (ans != null) {
          attempted++;
          if (Number(ans) === item.answer) correct++;
        }
      });
      return {
        id: item.id,
        code: item.code || '',
        question: item.question,
        correct,
        attempted,
        rate: attempted ? Math.round((correct / attempted) * 100) : 0
      };
    });

    return {
      assessmentId,
      studentCount: records.length,
      items,
      mostLearned: items.slice().sort((a, b) => b.rate - a.rate).slice(0, 5),
      leastLearned: items.slice().sort((a, b) => a.rate - b.rate).slice(0, 5)
    };
  }

  // ---- Normalize names (Title Case, trim, uppercase section) ----
  function normalizeNames() {
    const records = (window.Store && Store.getRecords()) || [];
    const changes = [];

    records.forEach((r, idx) => {
      const fix = {
        lastName: titleCase(r.lastName),
        firstName: titleCase(r.firstName),
        section: String(r.section || '').toUpperCase().replace(/\s+/g, '')
      };
      const changed = fix.lastName !== r.lastName ||
                      fix.firstName !== r.firstName ||
                      fix.section !== r.section;
      if (changed) {
        changes.push({
          idx,
          lrn: r.lrn,
          before: {
            lastName: r.lastName,
            firstName: r.firstName,
            section: r.section
          },
          after: fix
        });
      }
    });

    return { records, changes };
  }

  function applyNameNormalization(records, changes) {
    changes.forEach(c => {
      const r = records[c.idx];
      r.lastName = c.after.lastName;
      r.firstName = c.after.firstName;
      r.section = c.after.section;
      r.updatedAt = new Date().toISOString();
    });
    try {
      localStorage.setItem('physci_records', JSON.stringify(records));
      return true;
    } catch (e) {
      return false;
    }
  }

  function titleCase(str) {
    return String(str || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return {
    buildStudentIndex,
    filterStudents,
    classSummary,
    assessmentStats,
    groupBySeverity,
    getSections,
    itemAnalysis,
    normalizeNames,
    applyNameNormalization,
    titleCase
  };
})();
