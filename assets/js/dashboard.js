/* ============================================================
   dashboard.js — Physical Science · Student Dashboard Logic
   Version: 1.0.0
   Depends on: config.js, store.js, app.js, transmutation.js, ui-helpers.js
   ============================================================ */

window.Dashboard = (function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  async function init() {
    const student = (window.App && App.requireStudent) ? App.requireStudent() : null;
    if (!student) return;

    await (window.App && App.loadRegistry ? App.loadRegistry() : Promise.resolve());

    renderWelcome(student);
    renderStats(student);
    renderWeeks();
    renderRecentRecords(student);
  }

  function renderWelcome(student) {
    const el = $('welcome-card');
    if (!el) return;

    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    el.innerHTML = `
      <div class="dashboard-welcome-inner">
        <div class="welcome-avatar ${(window.UI && UI.avatarClass) ? UI.avatarClass(student.lrn) : ''}">
          ${(window.UI && UI.initials) ? UI.initials(student.firstName, student.lastName) : '?'}
        </div>
        <div>
          <div class="welcome-greet">${greet},</div>
          <div class="welcome-name">${(window.UI && UI.escapeHtml ? UI.escapeHtml(student.firstName) : '')} ${(window.UI && UI.escapeHtml ? UI.escapeHtml(student.lastName) : '')}</div>
          <div class="welcome-meta">
            LRN ${student.lrn} · Grade ${student.gradeLevel} · ${student.section}
          </div>
        </div>
      </div>
    `;
  }

  function renderStats(student) {
    const el = $('stats-grid');
    if (!el) return;

    const weeks = (window.App && App.getWeeks ? App.getWeeks() : []) || [];
    const records = (window.Store && Store.getRecordsByStudent ? Store.getRecordsByStudent(student.lrn) : []) || [];

    let daysCompleted = 0;
    weeks.forEach(w => {
      for (let d = 1; d <= 4; d++) {
        if (window.Store && Store.isDayComplete && Store.isDayComplete(w.n, d)) daysCompleted++;
      }
    });

    const totalDays = weeks.length * 4;
    const pct = totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0;
    const avg = records.length
      ? Math.round(records.reduce((s, r) => s + (Number(r.finalGrade) || 0), 0) / records.length)
      : 0;

    el.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-value">${daysCompleted} / ${totalDays}</div>
        <div class="stat-label">Days Completed</div>
      </div>
      <div class="stat-card ${pct >= 75 ? 'green' : 'amber'}">
        <div class="stat-icon">📈</div>
        <div class="stat-value">${pct}%</div>
        <div class="stat-label">Overall Progress</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-value">${records.length}</div>
        <div class="stat-label">Assessments Taken</div>
      </div>
      <div class="stat-card ${avg >= 75 ? 'green' : 'red'}">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">${records.length ? avg : '—'}</div>
        <div class="stat-label">Average Grade</div>
      </div>
    `;
  }

  function renderWeeks() {
    const el = $('weeks-grid');
    if (!el) return;

    const weeks = (window.App && App.getWeeks ? App.getWeeks() : []) || [];
    el.innerHTML = weeks.map(w => {
      const p = (window.Store && Store.getWeekProgress) ? Store.getWeekProgress(w.n, 4) : { done: 0, total: 4, percent: 0 };
      const color = p.percent >= 100 ? 'green' : p.percent > 0 ? 'amber' : '';
      return `
        <a class="week-progress-card" href="physci/week${w.n}/index.html">
          <div class="week-progress-icon">${w.icon}</div>
          <div class="week-progress-body">
            <div class="week-progress-num">Week ${w.n}</div>
            <div class="week-progress-title">${(window.UI && UI.escapeHtml ? UI.escapeHtml(w.title) : w.title)}</div>
            <div class="week-progress-bar">
              <div class="week-progress-fill ${color}" style="width:${p.percent}%;"></div>
            </div>
            <div class="week-progress-meta">${p.done} of ${p.total} days · ${p.percent}%</div>
          </div>
        </a>
      `;
    }).join('');
  }

  function renderRecentRecords(student) {
    const el = $('recent-records');
    if (!el) return;

    const records = (window.Store && Store.getRecordsByStudent ? Store.getRecordsByStudent(student.lrn) : []) || [];

    if (!records.length) {
      el.innerHTML = `<div class="empty-state">No assessments taken yet. Start learning to unlock your first quiz!</div>`;
      return;
    }

    const recent = records.slice().sort((a, b) =>
      new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0)
    ).slice(0, 5);

    el.innerHTML = `
      <div class="modern-table-wrap">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Score</th>
              <th>%</th>
              <th>Grade</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${recent.map(r => `
              <tr>
                <td>${(window.UI && UI.escapeHtml ? UI.escapeHtml(r.title || r.assessmentId) : r.assessmentId)}</td>
                <td>${r.score} / ${r.total}</td>
                <td>${r.percent}%</td>
                <td>${(window.UI && UI.gradeBadge) ? UI.gradeBadge(r.finalGrade) : r.finalGrade}</td>
                <td>${(window.UI && UI.formatDate) ? UI.formatDate(r.timestamp || r.createdAt) : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', init);

  return { init };
})();
