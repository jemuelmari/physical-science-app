/* ============================================================
   classrecord.js — Physical Science · Class Record Logic
   Version: 1.0.0
   Depends on: config.js, store.js, app.js, transmutation.js, ui-helpers.js
   ============================================================ */

window.ClassRecord = (function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  let assessments = [];
  let sectionFilterEl = null;
  let gradeFilterEl = null;

  async function init() {
    const teacher = (window.App && App.requireTeacher) ? App.requireTeacher() : null;
    if (!teacher) return;

    await (window.App && App.loadRegistry ? App.loadRegistry() : Promise.resolve());
    assessments = (window.App && App.getAssessments ? App.getAssessments() : []) || [];

    populateSectionFilter();
    bindEvents();
    render();
  }

  function populateSectionFilter() {
    sectionFilterEl = $('filter-section');
    if (!sectionFilterEl) return;

    const sections = new Set();
    ((window.Store && Store.getRecords()) || []).forEach(r => {
      if (r.section) sections.add(r.section);
    });
    [...sections].sort().forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      sectionFilterEl.appendChild(opt);
    });
  }

  function bindEvents() {
    gradeFilterEl = $('filter-grade');

    if (sectionFilterEl) sectionFilterEl.addEventListener('change', render);
    if (gradeFilterEl) gradeFilterEl.addEventListener('change', render);

    const btnRefresh = $('btn-refresh');
    if (btnRefresh) btnRefresh.addEventListener('click', render);

    const btnExport = $('btn-export-csv');
    if (btnExport) btnExport.addEventListener('click', exportCSV);

    const btnPrint = $('btn-print');
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());
  }

  function buildStudents() {
    const map = new Map();
    ((window.Store && Store.getRecords()) || []).forEach(r => {
      const key = r.lrn || 'unknown';
      if (!map.has(key)) {
        map.set(key, {
          lrn: key,
          lastName: r.lastName || '',
          firstName: r.firstName || '',
          gradeLevel: r.gradeLevel || '',
          section: r.section || '',
          scores: {}
        });
      }
      map.get(key).scores[r.assessmentId] = r;
    });
    return Array.from(map.values());
  }

  function render() {
    const sec = sectionFilterEl ? sectionFilterEl.value : '';
    const grd = gradeFilterEl ? gradeFilterEl.value : '';

    let students = buildStudents();
    if (sec) students = students.filter(s => s.section === sec);
    if (grd) students = students.filter(s => String(s.gradeLevel) === grd);
    students.sort((a, b) =>
      (a.lastName || '').localeCompare(b.lastName || '') ||
      (a.firstName || '').localeCompare(b.firstName || '')
    );

    const allRecords = (window.Store && Store.getRecords()) || [];
    const classAvg = allRecords.length
      ? Math.round(allRecords.reduce((s, r) => s + (Number(r.finalGrade) || 0), 0) / allRecords.length)
      : 0;
    const passed = allRecords.filter(r => r.passed).length;
    const passRate = allRecords.length ? Math.round((passed / allRecords.length) * 100) : 0;

    // Hero
    const heroStats = $('cr-hero-stats');
    if (heroStats) {
      heroStats.innerHTML = `
        <div style="text-align:center;">
          <div style="font-size:1.5rem;font-weight:800;">${students.length}</div>
          <div style="font-size:0.65rem;opacity:0.9;text-transform:uppercase;letter-spacing:0.5px;">Students</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1.5rem;font-weight:800;">${allRecords.length}</div>
          <div style="font-size:0.65rem;opacity:0.9;text-transform:uppercase;letter-spacing:0.5px;">Records</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1.5rem;font-weight:800;">${allRecords.length ? classAvg : '—'}</div>
          <div style="font-size:0.65rem;opacity:0.9;text-transform:uppercase;letter-spacing:0.5px;">Avg Grade</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1.5rem;font-weight:800;">${passRate}%</div>
          <div style="font-size:0.65rem;opacity:0.9;text-transform:uppercase;letter-spacing:0.5px;">Passing</div>
        </div>
      `;
    }

    // Stats
    const statsEl = $('cr-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="cr-stat-card blue">
          <div class="cs-icon">👥</div>
          <div class="cs-value">${students.length}</div>
          <div class="cs-label">Filtered Students</div>
        </div>
        <div class="cr-stat-card ${classAvg >= 75 ? 'green' : 'red'}">
          <div class="cs-icon">🎯</div>
          <div class="cs-value">${allRecords.length ? classAvg : '—'}</div>
          <div class="cs-label">Class Average</div>
        </div>
        <div class="cr-stat-card amber">
          <div class="cs-icon">✅</div>
          <div class="cs-value">${passRate}%</div>
          <div class="cs-label">Passing Rate</div>
        </div>
        <div class="cr-stat-card">
          <div class="cs-icon">📋</div>
          <div class="cs-value">${assessments.length}</div>
          <div class="cs-label">Assessments</div>
        </div>
      `;
    }

    // Gradebook
    const gb = $('gradebook');
    if (!gb) return;

    if (!students.length) {
      gb.innerHTML = `<div class="empty-state" style="padding:32px;text-align:center;">No students to display. Adjust filters.</div>`;
      return;
    }

    const esc = (window.UI && UI.escapeHtml) ? UI.escapeHtml : (s => String(s == null ? '' : s));
    const badge = (window.UI && UI.gradeBadge) ? UI.gradeBadge : (g => g);

    gb.innerHTML = `
      <table class="gradebook-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Grade</th>
            <th>Section</th>
            ${assessments.map(a => `<th>${shortTitle(a.id)}</th>`).join('')}
            <th>Average</th>
            <th>Transmuted</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => {
            const grades = assessments.map(a => {
              const rec = s.scores[a.id];
              return rec ? Number(rec.finalGrade) : null;
            });
            const valid = grades.filter(g => g != null);
            const avg = valid.length ? Math.round(valid.reduce((x, y) => x + y, 0) / valid.length) : null;
            const transmuted = avg != null && window.Transmutation ? Transmutation.apply(avg) : null;
            const passed = transmuted != null && transmuted >= 75;

            return `
              <tr>
                <td class="student-cell">
                  <div class="student-info">
                    <div class="name">${esc(s.lastName)}, ${esc(s.firstName)}</div>
                    <div class="meta">${esc(s.lrn)}</div>
                  </div>
                </td>
                <td>${esc(s.gradeLevel)}</td>
                <td>${esc(s.section)}</td>
                ${grades.map(g => g != null
                  ? `<td class="grade-cell">${g}</td>`
                  : `<td class="empty-cell">—</td>`
                ).join('')}
                <td class="final-grade">${avg != null ? avg : '—'}</td>
                <td class="final-grade ${passed ? 'passing' : 'failing'}">${transmuted != null ? transmuted : '—'}</td>
                <td>
                  ${transmuted != null
                    ? `<span class="status-badge ${passed ? 'pass' : 'fail'}">${passed ? '✓' : '✗'}</span>`
                    : `<span class="status-badge">—</span>`}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  function shortTitle(id) {
    const a = assessments.find(x => x.id === id);
    if (!a) return id;
    if (a.type === 'quiz') return 'Q' + id.replace('physci-quiz', '');
    if (a.type === 'summative') return 'ST' + id.replace('physci-st', '');
    if (a.type === 'term') return 'TE';
    if (a.type === 'performance') return 'PT';
    return id;
  }

  function exportCSV() {
    const students = buildStudents();
    const rows = [
      ['LRN', 'LastName', 'FirstName', 'GradeLevel', 'Section',
        ...assessments.map(a => shortTitle(a.id)),
        'Average', 'Transmuted', 'Status']
    ];

    students.forEach(s => {
      const grades = assessments.map(a => s.scores[a.id] ? s.scores[a.id].finalGrade : '');
      const valid = grades.filter(g => g !== '');
      const avg = valid.length ? Math.round(valid.reduce((x, y) => x + y, 0) / valid.length) : '';
      const transmuted = avg !== '' && window.Transmutation ? Transmutation.apply(avg) : '';
      const status = transmuted !== '' && transmuted >= 75 ? 'PASSED' : 'FAILED';
      rows.push([
        s.lrn, s.lastName, s.firstName, s.gradeLevel, s.section,
        ...grades, avg, transmuted, status
      ]);
    });

    const csv = rows.map(row =>
      row.map(c => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physci-class-record-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.addEventListener('DOMContentLoaded', init);

  return { init, render, exportCSV, buildStudents };
})();
