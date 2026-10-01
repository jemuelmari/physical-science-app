/* ============================================================
   transmutation.js — Physical Science · DepEd Grade Conversion
   Version: 1.0.0
   Depends on: config.js
   ============================================================ */

window.Transmutation = (function () {
  'use strict';

  // DepEd Order No. 8, s. 2015 — Transmutation Table
  // Input: raw percentage (0–100)
  // Output: transmuted grade (60–100)
  const TABLE = [
    { min: 100, max: 100, grade: 100 },
    { min: 98.40, max: 99.99, grade: 99 },
    { min: 96.80, max: 98.39, grade: 98 },
    { min: 95.20, max: 96.79, grade: 97 },
    { min: 93.60, max: 95.19, grade: 96 },
    { min: 92.00, max: 93.59, grade: 95 },
    { min: 90.40, max: 91.99, grade: 94 },
    { min: 88.80, max: 90.39, grade: 93 },
    { min: 87.20, max: 88.79, grade: 92 },
    { min: 85.60, max: 87.19, grade: 91 },
    { min: 84.00, max: 85.59, grade: 90 },
    { min: 82.40, max: 83.99, grade: 89 },
    { min: 80.80, max: 82.39, grade: 88 },
    { min: 79.20, max: 80.79, grade: 87 },
    { min: 77.60, max: 79.19, grade: 86 },
    { min: 76.00, max: 77.59, grade: 85 },
    { min: 74.40, max: 75.99, grade: 84 },
    { min: 72.80, max: 74.39, grade: 83 },
    { min: 71.20, max: 72.79, grade: 82 },
    { min: 69.60, max: 71.19, grade: 81 },
    { min: 68.00, max: 69.59, grade: 80 },
    { min: 66.40, max: 67.99, grade: 79 },
    { min: 64.80, max: 66.39, grade: 78 },
    { min: 63.20, max: 64.79, grade: 77 },
    { min: 61.60, max: 63.19, grade: 76 },
    { min: 60.00, max: 61.59, grade: 75 },
    { min: 56.00, max: 59.99, grade: 74 },
    { min: 52.00, max: 55.99, grade: 73 },
    { min: 48.00, max: 51.99, grade: 72 },
    { min: 44.00, max: 47.99, grade: 71 },
    { min: 40.00, max: 43.99, grade: 70 },
    { min: 36.00, max: 39.99, grade: 69 },
    { min: 32.00, max: 35.99, grade: 68 },
    { min: 28.00, max: 31.99, grade: 67 },
    { min: 24.00, max: 27.99, grade: 66 },
    { min: 20.00, max: 23.99, grade: 65 },
    { min: 16.00, max: 19.99, grade: 64 },
    { min: 12.00, max: 15.99, grade: 63 },
    { min: 8.00,  max: 11.99, grade: 62 },
    { min: 4.00,  max: 7.99,  grade: 61 },
    { min: 0,     max: 3.99,  grade: 60 }
  ];

  function apply(rawPercent) {
    const p = Math.max(0, Math.min(100, Number(rawPercent) || 0));
    for (let i = 0; i < TABLE.length; i++) {
      if (p >= TABLE[i].min && p <= TABLE[i].max) {
        return TABLE[i].grade;
      }
    }
    return 60;
  }

  function getDescriptor(grade) {
    const g = Number(grade);
    if (g >= 90) return { label: 'Outstanding',       code: 'O',  color: '#2e7d32' };
    if (g >= 85) return { label: 'Very Satisfactory', code: 'VS', color: '#0277bd' };
    if (g >= 80) return { label: 'Satisfactory',      code: 'S',  color: '#ed6c02' };
    if (g >= 75) return { label: 'Fairly Satisfactory', code: 'FS', color: '#e65100' };
    return       { label: 'Did Not Meet Expectations', code: 'DNME', color: '#c62828' };
  }

  function getTable() {
    return TABLE.slice();
  }

  return { apply, getDescriptor, getTable };
})();
