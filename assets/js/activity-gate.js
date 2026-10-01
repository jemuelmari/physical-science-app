/* ============================================================
   activity-gate.js — Physical Science · Assessment Gating
   Version: 1.0.0
   Depends on: config.js, store.js, app.js
   ============================================================ */

window.ActivityGate = (function () {
  'use strict';

  const TOTAL_DAYS_PER_WEEK = 4;

  function registry() {
    return (window.App && App.getRegistry) ? App.getRegistry() : { gating: {} };
  }

  function getRequirement(assessmentId) {
    const g = registry().gating || {};
    return g[assessmentId] || null;
  }

  function isWeekComplete(week) {
    if (!window.Store) return false;
    return Store.isWeekComplete(Number(week), TOTAL_DAYS_PER_WEEK);
  }

  function isUnlocked(assessmentId) {
    const req = getRequirement(assessmentId);
    if (!req) return true; // No gating rule → unlocked
    if (!req.requiresWeek) return true;
    return isWeekComplete(req.requiresWeek);
  }

  function getLockReason(assessmentId) {
    const req = getRequirement(assessmentId);
    if (!req) return null;
    if (!req.requiresWeek) return null;
    if (isWeekComplete(req.requiresWeek)) return null;

    const week = req.requiresWeek;
    const weekInfo = (window.App && App.getWeek) ? App.getWeek(week) : null;
    const title = weekInfo ? `Week ${week} — ${weekInfo.title}` : `Week ${week}`;
    return `Complete ${title} to unlock this assessment.`;
  }

  function getStatus(assessmentId) {
    return {
      assessmentId,
      unlocked: isUnlocked(assessmentId),
      reason: getLockReason(assessmentId),
      requirement: getRequirement(assessmentId)
    };
  }

  function listUnlocked() {
    const list = (window.App && App.getAssessments) ? App.getAssessments() : [];
    return list.filter(a => isUnlocked(a.id));
  }

  function listLocked() {
    const list = (window.App && App.getAssessments) ? App.getAssessments() : [];
    return list.filter(a => !isUnlocked(a.id));
  }

  // ---- Apply locking to UI ----
  function applyLocks(selector) {
    const sel = selector || '[data-assessment-id]';
    document.querySelectorAll(sel).forEach(el => {
      const id = el.getAttribute('data-assessment-id');
      if (!id) return;
      const status = getStatus(id);
      if (!status.unlocked) {
        el.classList.add('locked');
        el.setAttribute('aria-disabled', 'true');
        const link = el.querySelector('a') || (el.tagName === 'A' ? el : null);
        if (link) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            alert(status.reason || 'This assessment is locked.');
          });
        } else {
          el.addEventListener('click', (e) => {
            e.preventDefault();
            alert(status.reason || 'This assessment is locked.');
          });
        }
      }
    });
  }

  return {
    isUnlocked,
    getLockReason,
    getStatus,
    getRequirement,
    isWeekComplete,
    listUnlocked,
    listLocked,
    applyLocks
  };
})();
